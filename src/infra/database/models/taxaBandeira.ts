// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

const taxaBandeiraModel = (sequelize: Sequelize, dataTypes: DataTypes) => {

  const taxaBandeira = sequelize.define(
    'taxaBandeira',
    {
      taxaDebito: {
        type: dataTypes.FLOAT,
        allowNull: false
      },
      usuario: {
        type: dataTypes.STRING(100),
        allowNull: false
      }
    }
  );

  taxaBandeira.associate = (models) => {
    const { taxa, bandeira, taxaFaturamento } = models;

    taxaBandeira.belongsTo(taxa, { foreignKey: { field: 'taxaId', allowNull: false } });
    taxaBandeira.belongsTo(bandeira, { foreignKey: { field: 'bandeiraId', allowNull: false } });

    taxaBandeira.hasMany(
      taxaFaturamento,
      { as: 'faturamentos', foreignKey: { field: 'taxaBandeiraId', allowNull: false } }
    );
  };

  return taxaBandeira;
};

export default taxaBandeiraModel;
