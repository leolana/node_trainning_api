const Sequelize = require('sequelize');

const tipoTaxa = require('../service/participante/rateType.enum');

module.exports = (di) => {
  di.provide('@participante-taxa-historico.entities', () => {
    const _tiposTaxa = [];

    /* eslint-disable */
    for (const t in tipoTaxa) {
      _tiposTaxa.push(_tiposTaxa[t]);
    }
    /* eslint-enable */

    return Promise.resolve({
      identity: 'participanteTaxaHistorico',
      attributes: {
        participanteTaxaId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        valorInicio: {
          type: Sequelize.NUMERIC(12, 2),
          allowNull: true,
        },
        valorFim: {
          type: Sequelize.NUMERIC(12, 2),
          allowNull: true,
        },
        taxa: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        participanteId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        usuarioCriacao: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        dataInclusao: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        participanteTaxaTipo: {
          type: Sequelize.INTEGER,
          allowNull: false,
          isIn: [_tiposTaxa],
        },
      },
      associations: {
        belongsTo: {
          participante: {
            constraints: false,
          },
          participanteTaxa: {
            constraints: false,
          },
        },
      },
    });
  });
};
