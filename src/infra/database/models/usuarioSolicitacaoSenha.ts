// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';

const usuarioSolicitacaoSenhaModel = (sequelize: Sequelize, dataTypes: DataTypes)  => {

  const usuarioSolicitacaoSenha = sequelize.define(
    'usuarioSolicitacaoSenha',
    {
      codigo: {
        type: dataTypes.UUID,
        defaultValue: dataTypes.UUIDV1,
        primaryKey: true
      },
      email: {
        type: dataTypes.STRING(100),
        allowNull: false
      },
      expiraEm: {
        type: dataTypes.DATE,
        allowNull: false
      }
    }
  );

  return usuarioSolicitacaoSenha;
};

export default usuarioSolicitacaoSenhaModel;
