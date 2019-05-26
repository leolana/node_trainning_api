// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

const migrationModel = (sequelize: Sequelize, dataTypes: DataTypes) => {
  const migration = sequelize.define(
    '_migration',
    {
      key: {
        type: dataTypes.STRING(40),
        allowNull: false
      },
      executedAt: {
        type: dataTypes.DATE,
        allowNull: true
      }
    },
    {
      timestamps: false
    }
  );

  return migration;
};

export default migrationModel;
