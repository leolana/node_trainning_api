// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

const produtoModel = (sequelize: Sequelize, dataTypes: DataTypes) => {

  const produto = sequelize.define(
    'produto',
    {
      nome: {
        type: dataTypes.STRING(100),
        allowNull: false
      },
      descricao: {
        type: dataTypes.STRING(250)
      },
      usuario: {
        type: dataTypes.STRING(100),
        allowNull: false
      },
      ativo: {
        type: dataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      codigo: {
        type: dataTypes.SMALLINT,
        allowNull: true
      }
    }
  );

  produto.associate = (models) => {
    const { captura } = models;

    produto.hasMany(captura, { as: 'capturas', foreignKey: 'produtoId' });
  };

  return produto;
};

export default produtoModel;
