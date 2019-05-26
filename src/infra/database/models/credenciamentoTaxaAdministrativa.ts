// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

const credenciamentoTaxaAdministrativaModel = (sequelize: Sequelize, dataTypes: DataTypes) => {

  const credenciamentoTaxaAdministrativa = sequelize.define(
    'credenciamentoTaxaAdministrativa',
    {
      valor: {
        type: dataTypes.FLOAT,
        allowNull: false
      }
    }
  );

  credenciamentoTaxaAdministrativa.associate = (models) => {
    const { taxaAdministrativa } = models;

    credenciamentoTaxaAdministrativa.belongsTo(
      taxaAdministrativa,
      { foreignKey: { field: 'taxaAdministrativaId', allowNull: false } }
    );
  };

  return credenciamentoTaxaAdministrativa;
};

export default credenciamentoTaxaAdministrativaModel;
