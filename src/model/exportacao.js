const Sequelize = require('sequelize');

module.exports = (di) => {
  di.provide('@exportacao.entities', () => Promise.resolve({
    identity: 'exportacao',
    attributes: {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      arquivo: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      titulo: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      descricao: {
        type: Sequelize.STRING(250),
        allowNull: true,
      },
      ativo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    associations: {
      hasMany: {
        participanteExportacao: {
          as: 'participante',
          foreignKey: 'exportacaoId',
        },
      },
    },
  }));
};
