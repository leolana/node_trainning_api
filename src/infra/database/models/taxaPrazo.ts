// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

const taxaPrazoModel = (sequelize: Sequelize, dataTypes: DataTypes) => {

  const taxaPrazo = sequelize.define(
    'taxaPrazo',
    {
      prazo: {
        type: dataTypes.SMALLINT,
        allowNull: false,
      },
      coeficiente: {
        type: dataTypes.FLOAT,
        allowNull: false
      },
      minimo: {
        type: dataTypes.SMALLINT,
        allowNull: false
      },
      maximo: {
        type: dataTypes.SMALLINT,
        allowNull: false
      },
      usuario: {
        type: dataTypes.STRING(100),
        allowNull: false
      }
    }
  );

  taxaPrazo.associate = (models) => {
    const { taxa, evento, taxaAdministrativa } = models;

    taxaPrazo.belongsTo(taxa, { foreignKey: { field: 'taxaId', allowNull: false } });
    taxaPrazo.belongsTo(evento, { foreignKey: { field: 'eventoId', allowNull: false } });

    taxaPrazo.hasMany(
      taxaAdministrativa,
      { as: 'taxasAdministrativas', foreignKey: { field: 'taxaPrazoId', allowNull: false } }
    );
  };

  return taxaPrazo;
};

export default taxaPrazoModel;
