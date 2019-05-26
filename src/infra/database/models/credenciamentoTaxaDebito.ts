// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

const credenciamentoTaxaDebitoModel = (sequelize: Sequelize, dataTypes: DataTypes) => {

  const credenciamentoTaxaDebito = sequelize.define(
    'credenciamentoTaxaDebito',
    {
      valor: {
        type: dataTypes.FLOAT,
        allowNull: false
      }
    }
  );

  credenciamentoTaxaDebito.associate = (models) => {
    const { taxaBandeira } = models;

    credenciamentoTaxaDebito.belongsTo(taxaBandeira, { foreignKey: { field: 'taxaBandeiraId', allowNull: false } });
  };

  return credenciamentoTaxaDebito;
};

export default credenciamentoTaxaDebitoModel;
