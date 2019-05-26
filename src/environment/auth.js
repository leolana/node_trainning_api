const request = require('request-promise-native');
const jwt = require('jsonwebtoken');
const accountParams = require('../service/account/params.enum');
const tiposParticipante = require('../service/participante/type.enum');

const requireParticipante = (...tipos) => (req, res, next) => {
  const ehEstabelecimento = req.user.participanteEstabelecimento;
  const ehFornecedor = req.user.participanteFornecedor;

  const allowed = tipos.some((tipo) => {
    if (tipo === tiposParticipante.estabelecimento && ehEstabelecimento) {
      return true;
    }
    if (tipo === tiposParticipante.fornecedor && ehFornecedor) {
      return true;
    }
    return false;
  });

  if (allowed) next();
  else res.catch('access-denied');
};

module.exports = (di) => {
  di.provide(
    '$auth',
    '$main-db',
    '$mailer',
    '@auth-settings',
    '@@roles',
    '@@email-templates',
    '@@termo-tipo',
    (
      db,
      mailer,
      settings,
      roles,
      emailTemplates,
      tiposTermo
    ) => {
      const _rolesIds = {};

      const _authenticateAsAdmin = () => request({
        method: 'POST',
        uri: `${settings.address}/auth/realms/${settings.realm}`
          + '/protocol/openid-connect/token',
        form: {
          client_id: 'admin-cli',
          username: settings.adminUsername,
          password: settings.adminPassword,
          grant_type: 'password',
        },
      })
        .then(result => JSON.parse(result).access_token);

      const _addRoleToUser = (userId, token, role) => request({
        method: 'POST',
        uri: `${settings.address}/auth/admin/realms/${settings.realm}`
          + `/users/${userId}/role-mappings/clients/${settings.clientUUID}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: [{
          id: _rolesIds[role],
          name: role,
        }],
        json: true,
      });

      const _removeRoleFromUser = (userId, token, role) => request({
        method: 'DELETE',
        uri: `${settings.address}/auth/admin/realms/${settings.realm}`
          + `/users/${userId}/role-mappings/clients/${settings.clientUUID}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: [{
          id: _rolesIds[role],
          name: role,
        }],
        json: true,
      });

      const _parseResult = (result) => {
        const parsed = JSON.parse(result);

        return {
          accessToken: parsed.access_token,
          refreshToken: parsed.refresh_token,
        };
      };

      const _generateSessionToken = (usuario, participante, impersonating) => {
        let promise = impersonating
          ? Promise.resolve(participante)
          : db.entities.usuario.findOne({
            where: { email: usuario },
            include: [{
              model: db.entities.membro,
              as: 'associacoes',
              attributes: ['participanteId'],
            }],
          }).then((usuario) => {
            if (!usuario) throw String('usuario-not-found');

            const associacao = usuario.associacoes.find(
              a => a.participanteId === participante
            );

            return associacao && participante;
          });

        promise = promise.then(participanteId => (!participanteId
          ? Promise.resolve({})
          : Promise.all([
            db.entities.participante.findOne({
              where: { id: participanteId },
              attributes: ['nome'],
            }),
            db.entities.participanteEstabelecimento.count({
              where: { participanteId },
            }),
            db.entities.participanteFornecedor.count({
              where: { participanteId },
            }),
          ]).then(results => ({
            participante: participanteId,
            participanteNome: results[0].nome,
            participanteEstabelecimento: results[1] > 0,
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

            return db.entities.termo.findOne({
              where: {
                inicio: { $lte: today },
                fim: {
                  $or: {
                    $eq: null,
                    $gt: now,
                  },
                },
                tipo: result.participanteEstabelecimento
                  ? tiposTermo.contratoMaeEstabelecimento
                  : tiposTermo.contratoMaeFornecedor,
              },
              include: [{
                model: db.entities.participanteAceiteTermo,
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
            settings.clientSecret,
            { expiresIn: '24h' },
            (error, token) => {
              if (error) reject(error);
              else resolve({ sessionToken: token });
            }
          );
        }));
      };

      const _getUserRoles = req => req.user
        .resource_access[settings.clientId].roles;

      const _hasPermission = (req, ..._roles) => {
        const _userRoles = _getUserRoles(req);

        return _userRoles.includes(roles.super)
          || _userRoles.some(r => _roles.includes(r));
      };

      const _changeUserRoles = (userId, rolesToRemove, rolesToAdd) => (
        _authenticateAsAdmin()
          .then((token) => {
            const promises = [];

            promises.push(...rolesToRemove.map(
              r => _removeRoleFromUser(userId, token, r)
            ));
            promises.push(...rolesToAdd.map(
              r => _addRoleToUser(userId, token, r)
            ));

            return Promise.all(promises);
          }));

      return Promise.resolve({
        authenticateAsAdmin: _authenticateAsAdmin,
        getRolesIds: () => _authenticateAsAdmin()
          .then(token => request({
            method: 'GET',
            uri: `${settings.address}/auth/admin/realms/${settings.realm}`
              + `/clients/${settings.clientUUID}/roles`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
            json: true,
          }))
          .then((roles) => {
            roles.forEach((role) => {
              _rolesIds[role.name] = role.id;
            });
          }),
        authenticate: profile => request({
          method: 'POST',
          uri: `${settings.address}/auth/realms/${settings.realm}/`
            + 'protocol/openid-connect/token',
          form: {
            client_id: settings.clientId,
            client_secret: settings.clientSecret,
            username: profile.email,
            password: profile.password,
            grant_type: 'password',
          },
        })
          .then(_parseResult),
        refreshToken: _refreshToken => request({
          method: 'POST',
          uri: `${settings.address}/auth/realms/${settings.realm}/`
            + 'protocol/openid-connect/token',
          form: {
            client_id: settings.clientId,
            client_secret: settings.clientSecret,
            refresh_token: _refreshToken,
            grant_type: 'refresh_token',
          },
        })
          .then(_parseResult),
        require: (..._roles) => (req, res, next) => {
          if (_hasPermission(req, ..._roles)) next();
          else res.catch('access-denied');
        },
        requireParticipante,
        getUserRoles: _getUserRoles,
        hasPermission: _hasPermission,
        inviteUser: (convite, transaction) => {
          const findUser = () => db.entities.usuario.findOne({
            where: { email: convite.email },
            include: [{
              model: db.entities.membro,
              as: 'associacoes',
            }],
          });

          const checaUsuarioMembro = (usuario) => {
            if (!usuario) return true;

            if (usuario.associacoes && usuario.associacoes.some(
              a => a.participanteId === convite.participante
            )) {
              throw String('usuario-ja-e-membro');
            }

            usuario.roles.push(...convite.roles);

            return Promise.all([
              usuario.update({ roles: usuario.roles }, { transaction }),
              db.entities.membro.create({
                usuarioId: usuario.id,
                participanteId: convite.participante,
              }, { transaction }),
              _changeUserRoles(usuario.id, [], convite.roles),
            ])
              .then(() => false);
          };

          const enviaConvite = (invite) => {
            if (!invite) return null;

            const dataExpiracao = new Date();
            dataExpiracao.setDate(dataExpiracao.getDate()
              + accountParams.prazoExpiracaoConviteEmDias);

            convite.expiraEm = dataExpiracao;

            return db.entities.usuarioConvite
              .create(convite, { transaction })
              .then(convite => mailer.enviar({
                templateName: emailTemplates.DEFINIR_SENHA,
                destinatary: convite.email,
                substitutions: {
                  loginAcesso: convite.email,
                  linkRedefinirSenha: `${settings.baseUrl}/registrar/`
                    + `${convite.email}/${convite.codigo}`,
                },
              }));
          };

          return findUser()
            .then(checaUsuarioMembro)
            .then(enviaConvite);
        },
        createUser: (user) => {
          let _token = null;
          let _userId = null;

          return _authenticateAsAdmin()
            .then((token) => { _token = token; })
            .then(() => request({
              method: 'POST',
              uri: `${settings.address}/auth/admin/realms`
                + `/${settings.realm}/users`,
              headers: {
                Authorization: `Bearer ${_token}`,
              },
              body: {
                username: user.username,
                firstName: user.name,
                email: user.email,
                emailVerified: true,
                enabled: true,
                credentials: [{
                  type: 'password',
                  temporary: false,
                  value: user.password,
                }],
              },
              json: true,
            }))
            .then(() => request({
              method: 'GET',
              uri: `${settings.address}/auth/admin/realms/${settings.realm}`
                + `/users?username=${user.username}`,
              headers: {
                Authorization: `Bearer ${_token}`,
              },
              json: true,
            }))
            .then((results) => { _userId = results[0].id; })
            .then(() => Promise.all(user.roles.map(
              r => _addRoleToUser(_userId, _token, r)
            )))
            .then(() => _userId);
        },
        updateUserData: (user, changes) => _authenticateAsAdmin().then(
          (token) => {
            const oldRole = user.role;
            const newRole = changes.role;

            const promises = [request({
              method: 'PUT',
              uri: `${settings.address}/auth/admin/realms/${settings.realm}`
                + `/users/${user.id}`,
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: {
                // username: changes.email,
                firstName: changes.nome,
                // email: changes.email
              },
              json: true,
            })];

            if (oldRole !== newRole) {
              promises.push(
                request({
                  method: 'DELETE',
                  uri: `${settings.address}/auth/admin`
                    + `/realms/${settings.realm}`
                    + `/users/${user.id}/role-mappings`
                    + `/clients/${settings.clientUUID}`,
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                  body: [{
                    id: _rolesIds[oldRole],
                    name: oldRole,
                  }],
                  json: true,
                }),
                _addRoleToUser(user.id, token, newRole)
              );
            }

            return Promise.all(promises);
          }
        ),
        updateUserStatus: (user, enabled) => _authenticateAsAdmin().then(
          token => request({
            method: 'PUT',
            uri: `${settings.address}/auth/admin/realms`
              + `/${settings.realm}/users/${user.id}`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: {
              enabled,
            },
            json: true,
          })
        ),
        changeUserPassword: user => _authenticateAsAdmin().then(
          token => request({
            method: 'PUT',
            uri: `${settings.address}/auth/admin/realms/${settings.realm}`
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
        ),
        recoverPassword: (solicitacao) => {
          const dataExpiracao = new Date();
          dataExpiracao.setDate(dataExpiracao.getDate() + 1);

          solicitacao.expiraEm = dataExpiracao;

          return db.entities.usuarioSolicitacaoSenha
            .create(solicitacao)
            .then(solicitacao => mailer.enviar({
              templateName: emailTemplates.RESETAR_SENHA,
              destinatary: solicitacao.email,
              substitutions: {
                linkRedefinirSenha: `${settings.baseUrl}/redefinir-senha`
                  + `/${solicitacao.email}/${solicitacao.codigo}`,
              },
            }));
        },
        changeUserRoles: _changeUserRoles,
        generateSessionToken: _generateSessionToken,
      });
    }
  )
    .init('$auth', '$logger', (auth, logger) => {
      auth.getRolesIds().catch(error => logger.error(error));
    });
};
