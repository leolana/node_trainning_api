const Sequelize = require('sequelize');

module.exports = (di) => {
  di.provide('@motivo-tipo-recusa.entities', '@@recusa-tipo', (recusaTipo) => {
    const tiposRecusa = Object.values(recusaTipo);
    return Promise.resolve({
      identity: 'motivoTipoRecusa',
      attributes: {
        motivoRecusaId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        recusaTipoId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          isIn: [tiposRecusa],
        },
      },
      associations: {
        belongsTo: {
          motivoRecusa: {
            sourceKey: 'motivoRecusaId',
          },
        },
      },
    });
  });
};
