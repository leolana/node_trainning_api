const Sequelize = require('sequelize');

module.exports = (di) => {
  di.provide('@motivo-recusa.entities', () => Promise.resolve({
    identity: 'motivoRecusa',
    attributes: {
      codigo: {
        type: Sequelize.STRING(20),
      },
      descricao: {
        type: Sequelize.STRING(100),
      },
      requerObservacao: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      ativo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    associations: {
      hasMany: {
        motivoTipoRecusa: {
          as: 'tiposRecusa',
          foreignKey: 'motivoRecusaId',
        },
      },
    },
  }));
};
