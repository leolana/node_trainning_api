import { Router, Response, NextFunction } from 'express';
import { Request } from 'express-request';
import { injectable, inject } from 'inversify';
import { Sequelize } from 'sequelize-database';

import Controller from '../Controller';
import Auth from '../../../infra/auth/Auth';
import { LoggerInterface } from '../../../infra/logging';
import { Mailer } from '../../../infra/mailer';
import { rolesEnum as roles } from '../../../domain/services/auth/rolesEnum';
import { AccountUseCases, getAccountUseCases } from '../../../domain/usecases/account';
import { UsuarioUseCases, getUsuarioUseCases } from '../../../domain/usecases/usuario';

import types from '../../../constants/types';
import { config } from '../../../config';
import * as Exceptions from '../exceptions/ApiExceptions';

@injectable()
class UsuariosController implements Controller {
  auth: Auth;
  db: Sequelize;
  mailer: Mailer;
  emailTemplates: any;
  settings = config.mailer;

  accountUseCases: AccountUseCases;
  usuarioUseCases: UsuarioUseCases;

  constructor(
    @inject(types.Database) db: Sequelize,
    @inject(types.AuthFactory) auth: () => Auth,
    @inject(types.MailerFactory) mailer: () => Mailer,
    @inject(types.Logger) private logger: LoggerInterface
  ) {
    this.db = db;
    this.auth = auth();
    this.mailer = mailer();
    this.emailTemplates = this.mailer.emailTemplates;

    this.accountUseCases = getAccountUseCases(this.db, this.mailer, this.emailTemplates, this.settings, this.auth);
    this.usuarioUseCases = getUsuarioUseCases(this.db, this.auth, this.accountUseCases, this.logger);
  }

  get router(): Router {
    const router = Router();

    const require = this.auth.require(
      roles.boAdministrador,
      roles.boOperacoes,
      roles.ecAdministrador,
      roles.fcAdministrador
    );

    router.get('/usuarios', require, this.obterUsuarios);
    router.get('/convites', require, this.obterConvites);
    router.post('/usuarios/convites', require, this.convidar);
    router.put('/usuarios', require, this.atualizar);
    router.post('/register', this.cadastrar);
    router.put('/usuarios/reenviar-convite', require, this.reenviarConvite);
    router.put('/usuario/status', require, this.atualizarStatus);

    router.get(
      '/usuarios/participante/:idParticipante',
      this.auth.require(roles.boAdministrador, roles.boOperacoes, roles.super),
      this.obterUsuariosDoParticipante
    );

    router.get(
      '/convites/participante/:idParticipante',
      this.auth.require(roles.boAdministrador, roles.boOperacoes, roles.super),
      this.obterConvitesDoParticipante
    );

    router.get('/usuario/status', require, this.validateKeycloakUserStatus);

    return router;
  }

  rolesBackoffice = [roles.boAdministrador, roles.boOperacoes];
  rolesFornecedor = [roles.fcAdministrador, roles.fcFinanceiro, roles.fcComercial];
  rolesEstabelecimento = [roles.ecAdministrador, roles.ecFinanceiro, roles.ecCompras];

  private verificarPermissao = async (req: Request) => {
    const bodyRoles = req.body.roles;
    if (!bodyRoles) {
      throw new Exceptions.NoRoleSuppliedException();
    }

    const isSuper = bodyRoles.includes(roles.super);
    const authSuper = this.auth.hasPermission(req);
    if (isSuper && !authSuper) {
      throw new Exceptions.AccessDeniedException();
    }

    const isBackoffice = this.rolesBackoffice.some(r => bodyRoles.includes(r));
    const authBackoffice = this.auth.hasPermission(req, roles.boAdministrador);
    if (isBackoffice && !authBackoffice) {
      throw new Exceptions.AccessDeniedException();
    }

    const isFornecedor = this.rolesFornecedor.some(r => bodyRoles.includes(r));
    const authFornecedor = this.auth.hasPermission(req, ...this.rolesBackoffice, roles.fcAdministrador);
    if (isFornecedor && !authFornecedor) {
      throw new Exceptions.AccessDeniedException();
    }

    const isEstabelecimento = this.rolesEstabelecimento.some(r => bodyRoles.includes(r));
    const authEstabelecimento = this.auth.hasPermission(req, ...this.rolesBackoffice, roles.ecAdministrador);
    if (isEstabelecimento && !authEstabelecimento) {
      throw new Exceptions.AccessDeniedException();
    }
  }

  obterUsuarios = async (req: Request, res: Response, next: NextFunction) => {
    const participanteId = +req.user.participante || 0;
    const userStatus = +req.query.status;

    return this.usuarioUseCases.listUsersUseCase(participanteId, userStatus)
      .then((usuarios: any[]) => res.send(usuarios))
      .catch(next);
  }

  obterConvites = async (req: Request, res: Response, next: NextFunction) => {
    const participanteId = +req.user.participante || 0;
    const userStatus = +req.query.status;

    return this.usuarioUseCases.listInvitesUseCase(participanteId, userStatus)
      .then((convites: any[]) => res.send(convites))
      .catch(next);
  }

  convidar = async (req: Request, res: Response, next: NextFunction) => {
    const participanteId = +req.user.participante || 0;

    return this.verificarPermissao(req)
      .then(() => this.usuarioUseCases.inviteUserUseCase(
        req.body.nome,
        req.body.email,
        req.body.celular,
        req.body.roles,
        participanteId,
        req.user.email
      ))
      .then(() => res.end())
      .catch(next);
  }

  cadastrar = async (req: Request, res: Response, next: NextFunction) => {
    const participanteRoles = [...this.rolesEstabelecimento, ...this.rolesFornecedor];

    return this.usuarioUseCases
      .newUserFromInviteUseCase(
        req.body.codigo,
        req.body.email,
        req.body.password,
        participanteRoles
      )
      .then(() => res.end())
      .catch(next);
  }

  atualizar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.verificarPermissao(req);

      const userId = req.body.id;
      const user = await this.db.entities.usuario.findOne({ where: { id: userId } });
      if (!user) {
        throw new Exceptions.UserNotFoundException();
      }

      await this.usuarioUseCases.updateUserStatusUseCase(userId, true, req.user.email);

      delete req.body.id;
      await user.update({
        ...req.body,
        ativo: true
      });

      const oldRoles = user.roles;
      const newRoles = req.body.roles;

      const rolesToRemove = oldRoles.filter(r => !newRoles.includes(r));
      const rolesToAdd = newRoles.filter(r => !oldRoles.includes(r));

      await this.auth.changeUserRoles(user.id, rolesToRemove, rolesToAdd);

      res.end();
    } catch (error) {
      return next(error);
    }
  }

  atualizarStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.body.id;
      const userStatus = Boolean(req.body.ativo);

      await this.usuarioUseCases.updateUserStatusUseCase(userId, userStatus, req.user.email);

      res.end();
    } catch (error) {
      return next(error);
    }
  }

  reenviarConvite = async (req: Request, res: Response, next: NextFunction) => {
    const userEmail = req.body.email;

    return this.accountUseCases.resendInvite(userEmail)
      .then(() => res.end())
      .catch(next);
  }

  obterUsuariosDoParticipante = async (req: Request, res: Response, next: NextFunction) => {
    const idParticipante = +req.params.idParticipante;

    return this.usuarioUseCases
      .listUsersFromParticipantUseCase(idParticipante)
      .then(users => res.send(users))
      .catch(next);
  }

  obterConvitesDoParticipante = async (req: Request, res: Response, next: NextFunction) => {
    const idParticipante = +req.params.idParticipante;

    return this.usuarioUseCases
      .listInvitesFromParticipantUseCase(idParticipante)
      .then(invites => res.send(invites))
      .catch(next);
  }

  validateKeycloakUserStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.query.idUsuario;
      const result = await this.usuarioUseCases.validateKeycloakUserStatusUseCase(userId);
      res.send({ status: result.userStatus });
    } catch (error) {
      return next(error);
    }
  }

}

export default UsuariosController;
