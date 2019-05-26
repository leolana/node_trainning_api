// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

const participanteExportacaoModel = (sequelize: Sequelize, dataTypes: DataTypes) => {

  const participanteExportacao = sequelize.define(
    'participanteExportacao',
    {
      exportacaoId: {
        type: dataTypes.INTEGER,
        allowNull: false,
        unique: 'compositeUK',
      },
      participanteId: {
        type: dataTypes.INTEGER,
        allowNull: false,
        unique: 'compositeUK',
      },
    }
  );

  participanteExportacao.associate = (models) => {
    const { participante, exportacao } = models;

    participanteExportacao.belongsTo(participante, { foreignKey: 'participanteId' });
    participanteExportacao.belongsTo(exportacao, { foreignKey: 'exportacaoId' });
  };

  return participanteExportacao;
};

export default participanteExportacaoModel;
