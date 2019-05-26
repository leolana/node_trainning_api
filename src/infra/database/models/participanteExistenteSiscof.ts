// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

const participanteExistenteSiscofModel = (sequelize: Sequelize, dataTypes: DataTypes)  => {

  const participanteExistenteSiscof = sequelize.define(
    'participanteExistenteSiscof',
    {
      participanteId: {
        type: dataTypes.INTEGER,
        allowNull: false,
      },
      documento: {
        type: dataTypes.STRING(15),
        allowNull: true,
      },
    }
  );

  return participanteExistenteSiscof;
};

export default participanteExistenteSiscofModel;
