// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

const antecipacaoRecebivelModel = (sequelize: Sequelize, dataTypes: DataTypes) => {
  const antecipacaoRecebivel = sequelize.define(
    'antecipacaoRecebivel',
    {
      antecipacaoId: {
        type: dataTypes.INTEGER,
        allowNull: false
      },
      dataPagamento: {
        type: dataTypes.DATEONLY,
        allowNull: true
      },
      diasAntecipacao: {
        type: dataTypes.SMALLINT,
        allowNull: false
      },
      valorPagar : {
        type: dataTypes.FLOAT,
        allowNull: false
      },
      taxaAntecipacao: {
        type: dataTypes.FLOAT,
        allowNull: false
      },
      descontoAntecipacao: {
        type: dataTypes.FLOAT,
        allowNull: false
      },
      valorAntecipado : {
        type: dataTypes.FLOAT,
        allowNull: false
      },
      rowId: {
        type: dataTypes.STRING(30),
        allowNull: false
      },
      bandeiraId: {
        type: dataTypes.INTEGER,
        allowNull: true
      },
      eventoId: {
        type: dataTypes.INTEGER,
        allowNull: true
      }
    }
  );

  antecipacaoRecebivel.associate = (models) => {
    const { evento,  bandeira } = models;

    antecipacaoRecebivel.belongsTo(evento, { foreignKey: 'eventoId' });
    antecipacaoRecebivel.belongsTo(bandeira, { foreignKey: 'bandeiraId' });
  };

  return antecipacaoRecebivel;
};

export default antecipacaoRecebivelModel;
