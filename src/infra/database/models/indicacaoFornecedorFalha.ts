// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

const indicacaoFornecedorFalhaModel = (sequelize: Sequelize, dataTypes: DataTypes) => {

  const indicacaoFornecedorFalha = sequelize.define(
    'indicacaoFornecedorFalha',
    {
      participanteId: {
        type: dataTypes.INTEGER,
        allowNull: false
      },
      documento: {
        type: dataTypes.STRING(15),
        allowNull: false
      },
      usuario: {
        type: dataTypes.STRING(100),
        allowNull: false
      },
    }
  );

  indicacaoFornecedorFalha.associate = (models) => {
    const { participante } = models;

    indicacaoFornecedorFalha.belongsTo(participante, { foreignKey: 'participanteId' });
  };

  return indicacaoFornecedorFalha;
};

export default indicacaoFornecedorFalhaModel;
