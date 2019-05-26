const Sequelize = require('sequelize');

module.exports = (di) => {
  di.provide(
    '@credenciamento-instalacao.entities',
    '@@credenciamento-instalacao-horarios',
    (horarios) => {
      const _horarios = [];

      /* eslint-disable */
      for (const h in horarios) {
        _horarios.push(horarios[h]);
      }
      /* eslint-enable */

      return Promise.resolve({
        identity: 'credenciamentoInstalacao',
        attributes: {
          credenciamentoId: {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          cep: {
            type: Sequelize.STRING(8),
            allowNull: false,
          },
          logradouro: {
            type: Sequelize.STRING(200),
            allowNull: false,
          },
          numero: {
            type: Sequelize.STRING(15),
            allowNull: false,
          },
          complemento: {
            type: Sequelize.STRING(50),
          },
          bairro: {
            type: Sequelize.STRING(100),
            allowNull: false,
          },
          cidadeId: {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          pontoReferencia: {
            type: Sequelize.STRING(100),
          },
          dias: {
            type: Sequelize.SMALLINT,
            allowNull: false,
          },
          horario: {
            type: Sequelize.SMALLINT,
            allowNull: false,
            isIn: [_horarios],
          },
          nome: {
            type: Sequelize.STRING(100),
            allowNull: false,
          },
          email: {
            type: Sequelize.STRING(200),
            allowNull: false,
          },
          telefone: {
            type: Sequelize.STRING(10),
            allowNull: true,
          },
          celular: {
            type: Sequelize.STRING(11),
            allowNull: false,
          },
        },
        associations: {
          belongsTo: {
            cidade: { sourceKey: 'cidadeId' },
          },
        },
      });
    }
  );
};
