// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

const exportacaoModel = (sequelize: Sequelize, dataTypes: DataTypes) => {

  const exportacao = sequelize.define(
    'exportacao',
    {
      id: {
        type: dataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      arquivo: {
        type: dataTypes.STRING(50),
        allowNull: false,
      },
      titulo: {
        type: dataTypes.STRING(50),
        allowNull: true,
      },
      descricao: {
        type: dataTypes.STRING(250),
        allowNull: true,
      },
      ativo: {
        type: dataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    }
  );

  exportacao.associate = (models) => {
    const { participanteExportacao } = models;

    exportacao.hasMany(participanteExportacao, {
      as: 'participante',
      foreignKey: 'exportacaoId',
    });
  };

  return exportacao;
};

export default exportacaoModel;
