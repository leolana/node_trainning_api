// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

const bandeiraModel = (sequelize: Sequelize, dataTypes: DataTypes) => {
  const bandeira = sequelize.define(
    'bandeira',
    {
      nome: {
        type: dataTypes.STRING(100),
        allowNull: false
      },
      ativo: {
        type: dataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    }
  );

  return bandeira;
};

export default bandeiraModel;
