// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

const ticketMedioModel = (sequelize: Sequelize, dataTypes: DataTypes) => {

  const ticketMedio = sequelize.define(
    'ticketMedio',
    {
      descricao: {
        type: dataTypes.STRING(200),
        allowNull: false
      }
    }
  );

  return ticketMedio;
};

export default ticketMedioModel;
