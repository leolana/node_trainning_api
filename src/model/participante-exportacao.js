const Sequelize = require('sequelize');

module.exports = (di) => {
  di.provide('@participante-exportacao.entities', () => Promise.resolve({
    identity: 'participanteExportacao',
    attributes: {
      exportacaoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: 'compositeUK',
      },
      participanteId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: 'compositeUK',
      },
    },
    associations: {
      belongsTo: {
        participante: { sourceKey: 'participanteId' },
        exportacao: { sourceKey: 'exportacaoId' },
      },
    },
  }));
};
