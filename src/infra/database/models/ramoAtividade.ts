// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

const ramoAtividadeModel = (sequelize: Sequelize, dataTypes: DataTypes) => {
  const ramoAtividade = sequelize.define(
    'ramoAtividade',
    {
      codigo: {
        type: dataTypes.INTEGER,
        primaryKey: true
      },
      descricao: {
        type: dataTypes.STRING(100)
      },
      restritoPJ: {
        type: dataTypes.BOOLEAN,
        allowNull: false
      },
      ativo: {
        type: dataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      departamento: {
        type: dataTypes.SMALLINT,
        allowNull: true
      }
    }
  );

  return ramoAtividade;
};

export default ramoAtividadeModel;
