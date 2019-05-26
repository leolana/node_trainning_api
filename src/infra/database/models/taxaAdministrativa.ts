// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

const taxaAdministrativaModel = (sequelize: Sequelize, dataTypes: DataTypes) => {

  const taxaAdministrativa = sequelize.define(
    'taxaAdministrativa',
    {
      valorBase: {
        type: dataTypes.FLOAT,
        allowNull: false
      },
      usuario: {
        type: dataTypes.STRING(100),
        allowNull: false
      }
    }
  );

  taxaAdministrativa.associate = (models) => {
    const { bandeira, taxaPrazo } = models;

    taxaAdministrativa.belongsTo(bandeira, { foreignKey: { field: 'bandeiraId', allowNull: false } });
    taxaAdministrativa.belongsTo(taxaPrazo, { foreignKey: { field: 'taxaPrazoId', allowNull: false } });
  };

  return taxaAdministrativa;
};

export default taxaAdministrativaModel;
