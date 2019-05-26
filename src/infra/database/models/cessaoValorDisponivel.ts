// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

const cessaoValorDisponivelModel = (sequelize: Sequelize, dataTypes: DataTypes) => {

  const cessaoValorDisponivel = sequelize.define(
    'cessaoValorDisponivel',
    {
      participanteVinculoId: {
        type: dataTypes.INTEGER,
        allowNull: false,
      },
      dataConsulta: {
        type: dataTypes.DATEONLY,
        allowNull: true
      },
      valorDisponivel : {
        type: dataTypes.FLOAT,
        allowNull: true
      },
      usuario: {
        type: dataTypes.STRING(100),
        allowNull: true
      }
    }
  );

  cessaoValorDisponivel.associate = (models) => {
    const { participanteVinculo } = models;

    cessaoValorDisponivel.belongsTo(
      participanteVinculo, { foreignKey: 'participanteVinculoId' }
    );
  };

  return cessaoValorDisponivel;
};

export default cessaoValorDisponivelModel;
