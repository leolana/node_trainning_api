const accountUseCases = require('../usecase/account/index');
const listUsersUsecase = require('../usecase/usuario/listUsers.usecase');
const listInvitesUsecase = require('../usecase/usuario/listInvites.usecase');

module.exports = (di) => {
  di.provide(
    '#usuarios',
    '$main-db',
    '$auth',
    '@@usuario-status',
    '@@roles',
    '$mailer',
    '@@email-templates',
    '@auth-settings',
    (db, auth, status, roles, mailer, emailTemplates, settings) => {
      const useCases = accountUseCases(
        db,
        mailer,
        emailTemplates,
        settings,
        auth
      );

      const rolesBackoffice = [
        roles.boAdministrador,
        roles.boOperacoes,
      ];

      const rolesFornecedor = [
        roles.fcAdministrador,
        roles.fcFinanceiro,
        roles.fcComercial,
      ];

      const rolesEstabelecimento = [
        roles.ecAdministrador,
        roles.ecFinanceiro,
        roles.ecCompras,
      ];

      const _verificarPermissao = (req) => {
        if (!req.body.roles) throw String('no-role-supplied');

        const checkRoles = req.body.roles;
        const forbidden = 'operation-not-permitted';

        if (checkRoles.includes(roles.super) && !auth.hasPermission(req)) {
          throw forbidden;
        }

        if (rolesBackoffice.some(r => checkRoles.includes(r))
          && !auth.hasPermission(req, roles.boAdministrador)) {
          throw forbidden;
        }

        if (rolesFornecedor.some(r => checkRoles.includes(r))
          && !auth.hasPermission(
            req,
            roles.boAdministrador,
            roles.boOperacoes,
            roles.fcAdministrador,
          )) {
          throw forbidden;
        }

        if (rolesEstabelecimento.some(r => checkRoles.includes(r))
          && !auth.hasPermission(
            req,
            roles.boAdministrador,
            roles.boOperacoes,
            roles.ecAdministrador
          )) {
          throw forbidden;
        }

        return Promise.resolve();
      };

      const _verificarContato = email => db.entities.usuarioConvite.findOne({
        where: {
          email,
        },
        attributes: ['codigo', 'email', 'expiraEm'],
      });

      const _verificarUsuario = email => db.entities.usuario.findOne({
        where: {
          email,
        },
        attributes: ['email'],
      })
        .then(email => Boolean(email));

      return Promise.resolve({
        obterUsuarios: (req, res) => {
          const listUsers = listUsersUsecase(db);
          const participanteId = req.user.participante || 0;
          const userStatus = +req.query.status;

          return listUsers(participanteId, userStatus)
            .then(usuarios => res.send(usuarios))
            .catch(error => res.catch(error));
        },
        obterConvites: (req, res) => {
          const listInvites = listInvitesUsecase(db);
          const participanteId = req.user.participante || 0;
          const userStatus = +req.query.status;

          return listInvites(participanteId, userStatus)
            .then(usuarios => res.send(usuarios))
            .catch(error => res.catch(error));
        },
        convidar: (req, res) => Promise.all([
          _verificarContato(req.body.email),
          _verificarUsuario(req.body.email),
        ])
          .then((results) => {
            let prevalidate = null;

            if (results[1]) throw String('usuario-existente');
            if (results[0]) {
              const convite = results[0];

              if (convite.expiraEm >= new Date()) {
                throw String('convite-existente');
              } else {
                prevalidate = useCases.deleteInvite(convite.codigo);
              }
            } else {
              prevalidate = Promise.resolve();
            }

            return _verificarPermissao(req)
              .then(() => prevalidate)
              .then(() => auth.inviteUser({
                nome: req.body.nome,
                email: req.body.email,
                celular: req.body.celular,
                roles: req.body.roles,
                convidadoPor: req.user.email,
                participante: +req.user.participante || 0,
              }));
          })
          .then(() => res.end())
          .catch(error => res.catch(error)),
        cadastrar: (req, res) => Promise.all([
          db.entities.usuarioConvite.findOne({
            where: {
              codigo: req.body.codigo,
              email: req.body.email,
              expiraEm: { $gt: new Date() },
            },
          }),
          _verificarUsuario(req.body.email),
        ])
          .then((results) => {
            const convite = results[0];
            const email = results[1];

            if (!convite) throw String('convite-invalido');
            if (email) throw String('usuario-existente');

            return auth
              .createUser({
                username: convite.email,
                email: convite.email,
                name: convite.nome,
                roles: convite.roles,
                password: req.body.password,
              })
              .then(id => db.entities.usuario.create({
                id,
                nome: convite.nome,
                email: convite.email,
                celular: convite.celular,
                roles: convite.roles,
              })
                .then((usuario) => {
                  const promises = [
                    convite.destroy(),
                  ];

                  if (convite.roles.some(
                    c => rolesEstabelecimento.includes(c)
                  ) || (convite.roles.some(
                    c => rolesFornecedor.includes(c)
                  ))) {
                    promises.push(
                      db.entities.membro.create({
                        usuarioId: usuario.id,
                        participanteId: convite.participante,
                      })
                    );
                  }

                  return Promise.all(promises);
                }));
          })
          .then(() => res.end())
          .catch((error) => {
            res.catch(error);
          }),
        atualizar: (req, res) => {
          _verificarPermissao(req)
            .then(() => db.entities.usuario.findOne({
              where: {
                id: req.body.id,
              },
              include: [{
                model: db.entities.membro,
                as: 'associacoes',
                where: { participanteId: req.user.participante || 0 },
              }],
            }))
            .then((usuario) => {
              if (!usuario) throw String('usuario-not-found');

              delete req.body.id;

              const oldRoles = usuario.roles;
              const newRoles = req.body.roles;

              const rolesToRemove = oldRoles.filter(r => !newRoles.includes(r));
              const rolesToAdd = newRoles.filter(r => !oldRoles.includes(r));

              return Promise.all([
                usuario.update(req.body),
                auth.changeUserRoles(usuario.id, rolesToRemove, rolesToAdd),
              ]);
            })
            .then(() => res.end())
            .catch(error => res.catch(error));
        },
        atualizarStatus: (req, res) => {
          function get() {
            return db.entities.usuario.findOne({
              where: {
                id: req.body.id,
              },
            }).then((usuario) => {
              if (!usuario) throw String('usuario-not-found');
              return usuario;
            });
          }
          function update(usuario) {
            console.log(req.body);
            return usuario.update({
              ativo: Boolean(req.body.ativo),
            });
          }
          return get().then(update)
            .then(() => res.end())
            .catch(error => res.catch(error));
        },
        reenviarConvite: (req, res) => {
          const userEmail = req.body.email;

          return useCases
            .resendInvite(userEmail)
            .then(() => res.end())
            .catch(error => res.catch(error));
        },
      });
    }
  )
    .init(
      '#usuarios',
      '$server',
      '$auth',
      '@@roles',
      (controller, server, auth, roles) => {
        const _require = auth.require(
          roles.boAdministrador,
          roles.boOperacoes,
          roles.ecAdministrador,
          roles.fcAdministrador
        );

        server.get('/usuarios', _require, controller.obterUsuarios);
        server.get('/convites', _require, controller.obterConvites);
        server.post('/usuarios/convites', _require, controller.convidar);
        server.put('/usuarios', _require, controller.atualizar);
        server.put('/usuario/status', _require, controller.atualizarStatus);
        server.post('/register', controller.cadastrar);
        server.put('/usuarios/reenviar-convite',
          _require,
          controller.reenviarConvite);
      }
    );
};
