// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

const credenciamentoContatoModel = (sequelize: Sequelize, dataTypes: DataTypes) => {

  const credenciamentoContato = sequelize.define(
    'credenciamentoContato',
    {
      credenciamentoId: {
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
      }
    }
  );

  return credenciamentoContato;
};

export default credenciamentoContatoModel;
