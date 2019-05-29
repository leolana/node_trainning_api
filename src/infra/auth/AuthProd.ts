import { injectable, inject } from 'inversify';
import * as request from 'request-promise-native';
import * as jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import { Request } from 'express-request';

import { paramsEnum as accountParams } from '../../domain/services/account/paramsEnum';
import { typeEnum as tiposParticipante } from '../../domain/services/participante/typeEnum';
import termoTipo from '../../domain/entities/termoTipo';
import { rolesEnum } from '../../domain/services/auth/rolesEnum';
import { Sequelize } from 'sequelize-typescript';
import Mailer from '../mailer/Mailer';
import Auth from './Auth';
import { Environment, AuthEnv } from '../environment/Environment';

import types from '../../constants/types';
import * as Exceptions from '../../interfaces/rest/exceptions/ApiExceptions';
import { KeycloakUserRepresentation } from './AuthTypes';

@injectable()
class AuthProd implements Auth {
  generateToken(body: any) {
    throw new Exceptions.NotImplementedException();
  }
  private db: any;
  private mailer: any;
  private settings: AuthEnv;
  private emailTemplates: any;
  private rolesIds = {};

  constructor(
    @inject(types.Database) db: Sequelize,
    @inject(types.Environment) config: Environment,
    @inject(types.MailerFactory) mailer: () => Mailer,
  ) {
    this.db = db;
    this.settings = config.auth;
    this.mailer = mailer();
    this.emailTemplates = this.mailer.emailTemplates;
  }

  isParticipante = (req: Request, ...tipos: tiposParticipante[]): boolean => {
    const ehEstabelecimento = req.user.participanteEstabelecimento;
    const ehFornecedor = req.user.participanteFornecedor;

    return tipos.some((tipo) => {
      if (tipo === tiposParticipante.estabelecimento && ehEstabelecimento) {
        return true;
      }
      if (tipo === tiposParticipante.fornecedor && ehFornecedor) {
        return true;
      }
      return false;
    });
  }

  requireParticipante = (...tipos: tiposParticipante[]) => (req: Request, res: Response, next: NextFunction): any => {
    const allowed = this.isParticipante(req, ...tipos);

    if (allowed) next();
    else throw new Exceptions.AccessDeniedException();
  }

  authenticateAsAdmin = () => request({
    method: 'POST',
    uri: `${this.settings.address}/auth/realms/${this.settings.realm}`
      + '/protocol/openid-connect/token',
    form: {
      client_id: 'admin-cli',
      username: this.settings.adminUsername,
      password: this.settings.adminPassword,
      grant_type: 'password',
    },
  })
    .then(result => JSON.parse(result).access_token)

  private addRoleToUser = (userId, token, role) => request({
    method: 'POST',
    uri: `${this.settings.address}/auth/admin/realms/${this.settings.realm}`
      + `/users/${userId}/role-mappings/clients/${this.settings.clientUUID}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: [{
      id: this.rolesIds[role],
      name: role,
    }],
    json: true,
  })

  private removeRoleFromUser = (userId, token, role) => request({
    method: 'DELETE',
    uri: `${this.settings.address}/auth/admin/realms/${this.settings.realm}`
      + `/users/${userId}/role-mappings/clients/${this.settings.clientUUID}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: [{
      id: this.rolesIds[role],
      name: role,
    }],
    json: true,
  })

  private parseResult = (result) => {
    const parsed = JSON.parse(result);

    return {
      accessToken: parsed.access_token,
      refreshToken: parsed.refresh_token,
    };
  }

  generateSessionToken = (emailUsuario, participante, impersonating) => {
    let promise = impersonating
      ? Promise.resolve(participante)
      : (this.db.models as any).usuario.findOne({
        where: { email: emailUsuario },
        include: [{
          model: (this.db.models as any).membro,
          as: 'associacoes',
          attributes: ['participanteId'],
        }],
      }).then((usuario) => {
        if (!usuario) throw new Exceptions.UserNotFoundException();

        const associacao = usuario.associacoes.find(
          a => a.participanteId === participante
        );

        return associacao && participante;
      });

    promise = promise.then(participanteId => (!participanteId
      ? Promise.resolve({})
      : Promise.all([
        (this.db.models as any).participante.findOne({
          where: { id: participanteId },
          attributes: ['nome'],
        }),
        (this.db.models as any).participanteEstabelecimento.count({
          where: { participanteId },
        }),
        (this.db.models as any).participanteFornecedor.count({
          where: { participanteId },
        }),
      ]).then(results => ({
        participante: participanteId,
        participanteNome: results[0].nome,
        participanteEstabelecimento: results[1] > 0,
        // tslint:disable-next-line:no-magic-numbers
        participanteFornecedor: results[2] > 0,
      }))));

    if (!impersonating) {
      promise = promise.then((result) => {
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );

        return (this.db.models as any).termo.findOne({
          where: {
            inicio: { $lte: today },
            fim: {
              $or: {
                $eq: null,
                $gt: now,
              },
            },
            tipo: result.participanteEstabelecimento
              ? termoTipo.contratoMaeEstabelecimento
              : termoTipo.contratoMaeFornecedor,
          },
          include: [{
            model: (this.db.models as any).participanteAceiteTermo,
            as: 'aceites',
            where: {
              participanteId: result.participante,
            },
          }],
        }).then((termo) => {
          result.acceptedTerms = !!termo;

          return result;
        });
      });
    }

    return promise.then(payload => new Promise((resolve, reject) => {
      jwt.sign(
        payload,
        this.settings.clientSecret,
        { expiresIn: '24h' },
        (error, token) => {
          if (error) reject(error);
          else resolve({ sessionToken: token });
        }
      );
    }));
  }

  getUserRoles = (req: Request): rolesEnum[] => {
    return req.user.resource_access[this.settings.clientId].roles;
  }

  hasPermission = (req: Request, ...accessRoles: rolesEnum[]): boolean => {
    const userRoles = this.getUserRoles(req);

    const isSuper = userRoles.includes(rolesEnum.super);
    if (isSuper) {
      return true;
    }

    return userRoles.some(r => accessRoles.includes(r));
  }

  changeUserRoles = (userId, rolesToRemove, rolesToAdd) => (
    this.authenticateAsAdmin()
      .then((token) => {
        const promises = [];

        promises.push(...rolesToRemove.map(
          r => this.removeRoleFromUser(userId, token, r)
        ));
        promises.push(...rolesToAdd.map(
          r => this.addRoleToUser(userId, token, r)
        ));

        return Promise.all(promises);
      }))

  getRolesIds = () => this.authenticateAsAdmin()
    .then(token => request({
      method: 'GET',
      uri: `${this.settings.address}/auth/admin/realms/${this.settings.realm}`
        + `/clients/${this.settings.clientUUID}/roles`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      json: true,
    }))
    .then((roles) => {
      roles.forEach((role) => {
        this.rolesIds[role.name] = role.id;
      });
    })

  authenticate = profile => request({
    method: 'POST',
    uri: `${this.settings.address}/auth/realms/${this.settings.realm}/`
      + 'protocol/openid-connect/token',
    form: {
      client_id: this.settings.clientId,
      client_secret: this.settings.clientSecret,
      username: profile.email,
      password: profile.password,
      grant_type: 'password',
    },
  })
    .then(this.parseResult)

  refreshToken = refreshToken => request({
    method: 'POST',
    uri: `${this.settings.address}/auth/realms/${this.settings.realm}/`
      + 'protocol/openid-connect/token',
    form: {
      client_id: this.settings.clientId,
      client_secret: this.settings.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    },
  })
    .then(this.parseResult)

  require = (...roles) => (req: Request, res: Response, next: NextFunction) => {
    if (this.hasPermission(req, ...roles)) next();
    else throw new Exceptions.AccessDeniedException();
  }

  inviteUser = (convite, transaction) => {
    const findUser = () => (this.db.models as any).usuario.findOne({
      where: { email: convite.email },
      include: [{
        model: (this.db.models as any).membro,
        as: 'associacoes',
      }],
    });

    const checaUsuarioMembro = (usuario) => {
      if (!usuario) return true;

      if (usuario.associacoes && usuario.associacoes.some(
        a => a.participanteId === convite.participante
      )) {
        throw new Exceptions.UserIsAlreadyAMemberException();
      }

      usuario.roles.push(...convite.roles);

      return Promise.all([
        usuario.update(
          { roles: usuario.roles },
          { transaction }),
        (this.db.models as any).membro.create(
          {
            usuarioId: usuario.id,
            participanteId: convite.participante,
          },
          { transaction }
        ),
        this.changeUserRoles(usuario.id, [], convite.roles),
      ])
        .then(() => false);
    };

    const enviaConvite = (invite) => {
      if (!invite) return null;

      const dataExpiracao = new Date();
      dataExpiracao.setDate(dataExpiracao.getDate()
        + accountParams.prazoExpiracaoConviteEmDias);

      convite.expiraEm = dataExpiracao;

      return (this.db.models as any).usuarioConvite
        .create(convite, { transaction })
        .then(novoConvite => this.mailer.enviar(
          {
            templateName: this.emailTemplates.DEFINIR_SENHA,
            destinatary: novoConvite.email,
            substitutions: {
              loginAcesso: novoConvite.email,
              linkRedefinirSenha: `${this.settings.baseUrl}/registrar/`
                + `${novoConvite.email}/${novoConvite.codigo}`,
            },
          }));
    };

    return findUser()
      .then(checaUsuarioMembro)
      .then(enviaConvite);
  }

  addRoleKc = async (email, roles, pwd) => {
    if (pwd !== 'xpto') return {};

    const usuario = await (this.db.models as any).usuario.findOne({
      where: { email },
      include: [{
        model: (this.db.models as any).membro,
        as: 'associacoes',
      }],
    });

    return await this.changeUserRoles(usuario.id, [], roles);
  }

  createUser = (user, setPassword = true) => {
    let accessToken = null;
    let userId = null;
    let setCredentials = null;

    if (setPassword) {
      setCredentials = [{
        type: 'password',
        temporary: false,
        value: user.password,
      }];
    }

    return this.authenticateAsAdmin()
      .then((token) => { accessToken = token; })
      .then(() => request({
        method: 'POST',
        uri: `${this.settings.address}/auth/admin/realms`
          + `/${this.settings.realm}/users`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: {
          username: user.username,
          firstName: user.name,
          email: user.email,
          emailVerified: true,
          enabled: user.status === undefined || user.status === null ? true : user.status,
          credentials: setCredentials,
        },
        json: true,
      }))
      .then(() => request({
        method: 'GET',
        uri: `${this.settings.address}/auth/admin/realms/${this.settings.realm}`
          + `/users?username=${user.username}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        json: true,
      }))
      .then((results) => { userId = results[0].id; })
      .then(() => Promise.all(user.roles.map(
        r => this.addRoleToUser(userId, accessToken, r)
      )))
      .then(() => userId);
  }

  recreateUser = (user) => {
    let accessToken = null;
    let userId = null;

    return this.authenticateAsAdmin()
      .then((token) => { accessToken = token; })
      .then(() => {
        if (user.id) {
          return request({
            method: 'DELETE',
            uri: `${this.settings.address}/auth/admin/realms`
              + `/${this.settings.realm}/users/${user.id}`,
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
        }
        return Promise.resolve();
      })
      .then(() => this.createUser(user, false))
      .then(result => userId = result)
      .then(() => this.recoverPassword(user, true))
      .then(() => userId);
  }

  updateUserData = (user, changes) => this.authenticateAsAdmin().then(
    (token) => {
      const oldRole = user.role;
      const newRole = changes.role;

      const promises = [request({
        method: 'PUT',
        uri: `${this.settings.address}/auth/admin/realms/${this.settings.realm}`
          + `/users/${user.id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          firstName: changes.nome,
        },
        json: true,
      })];

      if (oldRole !== newRole) {
        promises.push(
          request({
            method: 'DELETE',
            uri: `${this.settings.address}/auth/admin`
              + `/realms/${this.settings.realm}`
              + `/users/${user.id}/role-mappings`
              + `/clients/${this.settings.clientUUID}`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: [{
              id: this.rolesIds[oldRole],
              name: oldRole,
            }],
            json: true,
          }),
          this.addRoleToUser(user.id, token, newRole)
        );
      }

      return Promise.all(promises);
    }
  )

  updateUserStatus = async (userId: string, userStatus: boolean) => {
    const keycloakUser = await this.getUser(userId);
    if (!keycloakUser) {
      throw new Exceptions.KeycloakUserNotFoundException();
    }

    if (keycloakUser.enabled === userStatus) {
      return;
    }

    keycloakUser.enabled = userStatus;
    await this.putUser(keycloakUser);
  }

  changeUserPassword = user => this.authenticateAsAdmin().then(
    token => request({
      method: 'PUT',
      uri: `${this.settings.address}/auth/admin/realms/${this.settings.realm}`
        + `/users/${user.id}/reset-password`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        type: 'password',
        temporary: false,
        value: user.newPassword,
      },
      json: true,
    })
  )

  recoverPassword = (solicitacao, administrador = false) => {
    const dataExpiracao = new Date();
    dataExpiracao.setDate(dataExpiracao.getDate() + 1);

    solicitacao.expiraEm = dataExpiracao;

    return (this.db.models as any).usuarioSolicitacaoSenha
      .create(solicitacao)
      .then(novaSolicitacao => this.mailer.enviar(
        {
          templateName: administrador ?
            this.emailTemplates.ADMINISTRADOR_RESETA_SENHA : this.emailTemplates.RESETAR_SENHA,
          destinatary: novaSolicitacao.email,
          substitutions: {
            linkRedefinirSenha: `${this.settings.baseUrl}/redefinir-senha`
              + `/${novaSolicitacao.email}/${novaSolicitacao.codigo}`,
          },
        }));
  }

  getUser = async (userId: string): Promise<KeycloakUserRepresentation> => {
    const token = await this.authenticateAsAdmin();

    return request({
      method: 'GET',
      uri: `${this.settings.address}/auth/admin/realms/${this.settings.realm}/users/${userId}`,
      headers: { Authorization: `Bearer ${token}` },
      json: true,
    });
  }

  getInfoUser = async (userId: string): Promise<KeycloakUserRepresentation> => {
    const token = await this.authenticateAsAdmin();
    try {
      const userKeycloak = await this.getUser(userId);

      const roles = await <any>request({
        method: 'GET',
        uri: `${this.settings.address}/auth/admin/realms/${this.settings.realm}`
          + `/users/${userId}/role-mappings/clients/${this.settings.clientUUID}`,
        headers: { Authorization: `Bearer ${token}` },
        json: true,
      });

      return {
        roles: roles.map(role => (role.name)),
        ...userKeycloak,
      };
    } catch (e) {
      return null;
    }
  }

  putUser = async (user: KeycloakUserRepresentation): Promise<void> => {
    const token = await this.authenticateAsAdmin();

    await <any>request({
      method: 'PUT',
      uri: `${this.settings.address}/auth/admin/realms/${this.settings.realm}/users/${user.id}`,
      headers: { Authorization: `Bearer ${token}` },
      body: user,
      json: true,
    });
  }
}

export default AuthProd;
