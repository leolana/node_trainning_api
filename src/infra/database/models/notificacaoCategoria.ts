// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

const notificacaoCategoriaModel = (sequelize: Sequelize, dataTypes: DataTypes) => {

  const notificacaoCategoria = sequelize.define(
    'notificacaoCategoria',
    {
      categoria: {
        type: dataTypes.STRING(50),
        allowNull: false,
      },
      ativo: {
        type: dataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    }
  );

  return notificacaoCategoria;
};

export default notificacaoCategoriaModel;
