// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

const participanteContatoModel = (sequelize: Sequelize, dataTypes: DataTypes) => {

  const participanteContato = sequelize.define(
    'participanteContato',
    {
      participanteId: {
        type: dataTypes.INTEGER,
        allowNull: false
      },
      nome: {
        type: dataTypes.STRING(100),
        allowNull: false
      },
      email: {
        type: dataTypes.STRING(200),
        allowNull: false
      },
      telefone: {
        type: dataTypes.STRING(11),
        allowNull: true
      },
      celular: {
        type: dataTypes.STRING(11),
        allowNull: false
      },
      ativo: {
        type: dataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
    }
  );

  return participanteContato;
};

export default participanteContatoModel;
