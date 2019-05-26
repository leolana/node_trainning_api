// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

const faturamentoCartaoModel = (sequelize: Sequelize, dataTypes: DataTypes) => {

  const faturamentoCartao = sequelize.define(
    'faturamentoCartao',
    {
      descricao: {
        type: dataTypes.STRING(200),
        allowNull: false
      },
      ativo: {
        type: dataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
    }
  );

  return faturamentoCartao;
};

export default faturamentoCartaoModel;
