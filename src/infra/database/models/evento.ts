// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

const eventoModel = (sequelize: Sequelize, dataTypes: DataTypes) => {

  const evento = sequelize.define(
    'evento',
    {
      nome: {
        type: dataTypes.STRING(100),
        allowNull: false
      },
    }
  );

  return evento;
};

export default eventoModel;
