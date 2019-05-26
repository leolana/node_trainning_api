import { Router, Response, NextFunction } from 'express';
import { Request } from 'express-request';
import { injectable, inject } from 'inversify';
import { Sequelize } from 'sequelize-database';

import Controller from '../Controller';
import Auth from '../../../infra/auth/Auth';
import { LoggerInterface } from '../../../infra/logging';
import { Mailer } from '../../../infra/mailer';
import { getAccountUseCases, AccountUseCases } from '../../../domain/usecases/account';
import { rolesEnum as roles } from '../../../domain/services/auth/rolesEnum';

import { config } from '../../../config';
import types from '../../../constants/types';
import { LoginFailedException } from '../exceptions/ApiExceptions';

@injectable()
class AccountController implements Controller {
  auth: Auth;
  db: Sequelize;
  logger: LoggerInterface;
  mailer: Mailer;
  emailTemplates: any;
  settings: any;
  useCases: AccountUseCases;

  constructor(
    @inject(types.AuthFactory) auth: () => Auth,
    @inject(types.Database) db: Sequelize,
    @inject(types.Logger) logger: LoggerInterface,
    @inject(types.MailerFactory) mailer: () => Mailer
  ) {
    this.auth = auth();
    this.db = db;
    this.logger = logger;
    this.mailer = mailer();
    this.emailTemplates = this.mailer.emailTemplates;
    this.settings = config.auth;

    this.useCases = getAccountUseCases(
      db,
      this.mailer,
      this.emailTemplates,
      this.settings,
      this.auth
    );
  }

  get router(): Router {
    const router = Router();

    router.post('/signin', this.signin);
    router.post('/memberships', this.memberships);
    router.post('/initiate-gateway', this.initiateSessionGateway);
    router.post('/initiate-session', this.initiateSession);
    router.post('/refresh-token', this.refresh);
    router.post('/change-password', this.changePassword);
    router.post('/recover-password', this.recoverPassword);
    router.post('/reset-password', this.resetPassword);
    router.post(
      '/impersonate',
      this.auth.require(roles.boAdministrador, roles.boOperacoes),
      this.impersonate,
    );

    return router;
  }

  signin = async (req: Request, res: Response, next: NextFunction) => {
    const handleError = (error) => {
      throw new LoginFailedException();
    };

    return this.auth
      .authenticate(req.body)
      .then(tokens => res.send(tokens))
      .catch(handleError)
      .catch(next);
  }

  memberships = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    const findUsuario = () => {
      return this.db.entities.usuario.findOne({
        where: { email },
        include: [{
          model: this.db.entities.membro,
          as: 'associacoes',
          include: [{
            model: this.db.entities.participante,
            as: 'participante',
            attributes: ['id', 'nome'],
          }],
        }],
      });
    };

    const mapParticipantes = (usuario) => {
      if (usuario) {
        return usuario.associacoes.map(m => m.participante.dataValues);
      }
      return [];
    };

    return findUsuario()
      .then(mapParticipantes)
      .then(participantes => res.send(participantes))
      .catch((error) => {
        this.logger.info(`Usuário ${email} não conseguiu trazer os memberships`);
        this.logger.error(error);
        return next(error);
      });
  }

  initiateSession = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { email } = req.user;
    const id = +req.body.participanteId;

    const sendTokens = (tokens) => {
      res.send(tokens);

      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

      this.logger.info(
        `Usuário ${email} iniciou uma sessão com o participante`
        + `${id} sob o IP: ${ip}`,
      );
    };

    return this.auth
      .generateSessionToken(email, id)
      .then(sendTokens)
      .catch((error) => {
        this.logger.info(`Usuário ${email} iniciou uma sessão com o participante ${id}`);
        this.logger.error(error);
        return next(error);
      });
  }

  initiateSessionGateway = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.user;

    const findParticipante = () => this.db.entities.participante.findOne({
      where: { documento: req.body.cnpjFornecedor },
    });

    const checkParticipante = (participante) => {
      if (!participante) {
        throw new Error('fornecedor-nao-encontrado');
      }
      return participante;
    };

    const sendTokens = (tokens, participante) => {
      res.send(tokens);
      this.logger.info(
        `Usuário ${req.user.email} iniciou uma sessão com o `
        + `participante ${participante.id} sob o IP: `
        + `${req.headers['x-forwarded-for'] || req.connection.remoteAddress}`
      );
    };

    const getTokens = (participante) => {
      const id = +participante.id;

      return this.auth
        .generateSessionToken(email, id, true)
        .then(tokens => sendTokens(tokens, participante));
    };

    return findParticipante()
      .then(checkParticipante)
      .then(getTokens)
      .catch(next);
  }

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;

    return this.auth
      .refreshToken(refreshToken)
      .then(tokens => res.send(tokens))
      .catch(next);
  }

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    const findUsuario = () => this.db.entities.usuario.findOne({
      where: {
        email: req.body.email,
      },
    });

    return this.auth
      .generateToken(req.body)
      .then(findUsuario)
      .then((usuario) => {
        if (!usuario) throw new Error('usuario-not-found');

        req.body.id = usuario.id;

        return this.auth.changeUserPassword(req.body);
      })
      .then(() => res.end())
      .catch(next);
  }

  recoverPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    return this.useCases
      .recoverPass(email)
      .then((ok) => {
        if (!ok) {
          return this.useCases.resendInvite(email);
        }
        return true;
      })
      .then(() => res.end())
      .catch(next);
  }

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { codigo, email } = req.body;

    const findUsuario = () => {
      const where = {
        email,
      };
      return this.db.entities.usuario.findOne({ where });
    };

    const findUsuarioSolicitacaoSenha = () => {
      const where = {
        codigo,
        email,
        expiraEm: {
          $gt: new Date(),
        },
      };
      return this.db.entities.usuarioSolicitacaoSenha.findOne({ where });
    };

    const action = (results) => {
      const solicitacao = results[0];
      if (!solicitacao) {
        throw new Error('solicitacao-invalida');
      }

      const usuario = results[1];
      if (!usuario) {
        throw new Error('usuario-not-found');
      }

      req.body.id = usuario.id;

      return this.auth
        .changeUserPassword(req.body)
        .then(() => solicitacao.destroy());
    };

    return Promise
      .all([
        findUsuarioSolicitacaoSenha(),
        findUsuario(),
      ])
      .then(action)
      .then(() => res.end())
      .catch(next);
  }

  impersonate = async (req: Request, res: Response, next: NextFunction) => {
    const userEmail = req.user.email;
    const id = +req.body.participanteId;

    return this.auth
      .generateSessionToken(userEmail, id, true)
      .then(tokens => res.send(tokens))
      .catch(next);
  }
}

export default AccountController;
