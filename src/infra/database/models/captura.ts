// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

export const tiposCaptura = {
  aluguel: 1,
  venda: 2
};

const capturaModel = (sequelize: Sequelize, dataTypes: DataTypes) => {
  const captura = sequelize.define(
    'captura',
    {
      produtoId: {
        type: dataTypes.INTEGER,
        allowNull: false
      },
      inicio: {
        type: dataTypes.DATEONLY,
        allowNull: false
      },
      fim: {
        type: dataTypes.DATEONLY,
        allowNull: true
      },
      tipoCaptura: {
        type: dataTypes.SMALLINT,
        allowNull: false,
        validate: {
          isIn: [<any[]>Object.values(tiposCaptura)]
        },
      },
      valor: {
        type: dataTypes.FLOAT,
        allowNull: false
      },
      usuario: {
        type: dataTypes.STRING(100),
        allowNull: false
      }
    }
  );

  captura.associate = (models) => {
    const { produto } = models;

    captura.belongsTo(produto, { foreignKey: 'produtoId' });
  };

  return captura;
};

export default capturaModel;
