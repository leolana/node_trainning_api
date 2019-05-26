// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

const credenciamentoCapturaModel = (sequelize: Sequelize, dataTypes: DataTypes) => {

  const credenciamentoCaptura = sequelize.define(
    'credenciamentoCaptura',
    {
      credenciamentoId: {
        type: dataTypes.INTEGER,
        allowNull: false
      },
      capturaId: {
        type: dataTypes.INTEGER,
        allowNull: false
      },
      quantidade: {
        type: dataTypes.SMALLINT,
        allowNull: false
      },
      valor: {
        type: dataTypes.FLOAT,
        allowNull: false
      }
    }
  );

  credenciamentoCaptura.associate = (models) => {
    const { captura } = models;

    credenciamentoCaptura.belongsTo(captura, { foreignKey: 'capturaId' });
  };

  return credenciamentoCaptura;
};

export default credenciamentoCapturaModel;
