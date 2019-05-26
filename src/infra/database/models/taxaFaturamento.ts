// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

const taxaFaturamentoModel = (sequelize: Sequelize, dataTypes: DataTypes) => {

  const taxaFaturamento = sequelize.define(
    'taxaFaturamento',
    {
      coeficiente: {
        type: dataTypes.FLOAT,
        allowNull: false
      },
      usuario: {
        type: dataTypes.STRING(100),
        allowNull: false
      }
    }
  );

  taxaFaturamento.associate = (models) => {
    const { faturamentoCartao, taxaBandeira } = models;

    taxaFaturamento.belongsTo(faturamentoCartao, { foreignKey: { field: 'faturamentoCartaoId', allowNull: false } });
    taxaFaturamento.belongsTo(taxaBandeira, { foreignKey: { field: 'taxaBandeiraId', allowNull: false } });
  };

  return taxaFaturamento;
};

export default taxaFaturamentoModel;
