const accountUseCases = require('../usecase/account/index');

const controller = (auth, db, logger, mailer, emailTemplates, settings) => {
  const useCases = accountUseCases(
    db,
    mailer,
    emailTemplates,
    settings,
    auth
  );
  this.signin = (req, res) => {
    const handleError = (error) => {
      logger.error(error);
      res.catch('email-senha-invalido');
    };

    return auth
      .authenticate(req.body)
      .then(tokens => res.send(tokens))
      .catch(handleError);
  };

  this.memberships = (req, res) => {
    const findUsuario = () => {
      const { email } = req.body;

      return db.entities.usuario.findOne({
        where: { email },
        include: [{
          model: db.entities.membro,
          as: 'associacoes',
          include: [{
            model: db.entities.participante,
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
        logger.info(
          `Usuário ${email} não conseguiu trazer os memberships`,
        );
        logger.error(error);
        res.catch(error);
      });
  };

  this.initiateSession = (req, res) => {
    const { email } = req.user;
    const id = +req.body.participanteId;

    const sendTokens = (tokens) => {
      res.send(tokens);

      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

      logger.info(
        `Usuário ${email} iniciou uma sessão com o participante`
        + `${id} sob o IP: ${ip}`,
      );
    };

    return auth
      .generateSessionToken(email, id)
      .then(sendTokens)
      .catch((error) => {
        logger.info(`Usuário ${email} iniciou uma sessão com o participante ${id}`);
        logger.error(error);
        res.catch(error);
      });
  };

  this.initiateSessionGateway = (req, res) => {
    const { email } = req.user;

    const findParticipante = () => db.entities.participante.findOne({
      where: { documento: req.body.cnpjFornecedor },
    });

    const checkParticipante = (participante) => {
      if (!participante) {
        throw String('fornecedor-nao-encontrado');
      }
      return participante;
    };

    const sendTokens = (tokens, participante) => {
      res.send(tokens);
      logger.info(
        `Usuário ${req.user.email} iniciou uma sessão com o `
        + `participante ${participante.id} sob o IP: `
        + `${req.headers['x-forwarded-for'] || req.connection.remoteAddress}`
      );
    };

    const getTokens = (participante) => {
      const id = +participante.id;

      return auth
        .generateSessionToken(email, id, true)
        .then(tokens => sendTokens(tokens, participante));
    };

    return findParticipante()
      .then(checkParticipante)
      .then(getTokens)
      .catch(error => res.catch(error));
  };

  this.refresh = (req, res) => {
    const { refreshToken } = req.body;

    return auth
      .refreshToken(refreshToken)
      .then(tokens => res.send(tokens))
      .catch(error => res.catch(error));
  };

  this.changePassword = (req, res) => {
    const findUsuario = () => db.entities.usuario.findOne({
      where: {
        email: req.body.email,
      },
    });

    return auth
      .generateToken(req.body)
      .then(findUsuario)
      .then((usuario) => {
        if (!usuario) throw String('usuario-not-found');

        req.body.id = usuario.id;

        return auth.changeUserPassword(req.body);
      })
      .then(() => res.end())
      .catch(error => res.catch(error));
  };

  this.recoverPassword = (req, res) => {
    const { email } = req.body;

    return useCases
      .recoverPass(email)
      .then((ok) => {
        if (!ok) {
          return useCases.resendInvite(email);
        }
        return true;
      })
      .then(() => res.end())
      .catch(error => res.catch(error));
  };

  this.resetPassword = (req, res) => {
    const { codigo, email } = req.body;

    const findUsuario = () => {
      const where = {
        email,
      };
      return db.entities.usuario.findOne({ where });
    };

    const findUsuarioSolicitacaoSenha = () => {
      const where = {
        codigo,
        email,
        expiraEm: {
          $gt: new Date(),
        },
      };
      return db.entities.usuarioSolicitacaoSenha.findOne({ where });
    };

    const action = (results) => {
      const solicitacao = results[0];
      if (!solicitacao) {
        throw String('solicitacao-invalida');
      }

      const usuario = results[1];
      if (!usuario) {
        throw String('usuario-not-found');
      }

      req.body.id = usuario.id;

      return auth
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
      .catch(error => res.catch(error));
  };

  this.impersonate = (req, res) => {
    const userEmail = req.user.email;
    const id = +req.body.participanteId;

    return auth
      .generateSessionToken(userEmail, id, true)
      .then(tokens => res.send(tokens))
      .catch(error => res.catch(error));
  };

  return Promise.resolve(this);
};

module.exports = (di) => {
  di.provide(
    '#account',
    '$auth',
    '$main-db',
    '$logger',
    '$mailer',
    '@@email-templates',
    '@auth-settings',
    controller
  ).init(
    '#account',
    '$server',
    '$auth',
    '@@roles',
    (controller, server, auth, roles) => {
      server.post('/signin', controller.signin);
      server.post('/memberships', controller.memberships);
      server.post('/initiate-gateway', controller.initiateSessionGateway);
      server.post('/initiate-session', controller.initiateSession);
      server.post('/refresh-token', controller.refresh);
      server.post('/change-password', controller.changePassword);
      server.post('/recover-password', controller.recoverPassword);
      server.post('/reset-password', controller.resetPassword);
      server.post(
        '/impersonate',
        auth.require(roles.boAdministrador, roles.boOperacoes),
        controller.impersonate,
      );
    }
  );
};
