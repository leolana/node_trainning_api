// tslint:disable:no-magic-numbers
import { Sequelize, DataTypes } from 'sequelize-database';
import notificacaoCategoriaEnum from '../../../domain/services/notificacoes/notificacaoCategoriaEnum';

const notificacaoModel = (sequelize: Sequelize, dataTypes: DataTypes) => {

  const notificacao = sequelize.define(
    'notificacao',
    {
      categoriaId: {
        type: dataTypes.INTEGER,
        allowNull: false,
        validate: {
          isIn: [<any[]>Object.values(notificacaoCategoriaEnum)]
        }
      },
      criadorId: {
        type: dataTypes.UUID,
        allowNull: true,
      },
      mensagem: {
        type: dataTypes.STRING(200),
        allowNull: false,
      },
      dataExpiracao: {
        type: dataTypes.DATE,
        allowNull: false,
      }
    }
  );
  notificacao.associate = (models) => {
    const { notificacaoCategoria, usuario, usuarioNotificacao } = models;

    notificacao.belongsTo(notificacaoCategoria, { foreignKey: 'categoriaId' });
    notificacao.belongsTo(usuario, { foreignKey: 'criadorId' });
    notificacao.hasMany(usuarioNotificacao, { as: 'usuarioNotificacao', foreignKey: 'notificacaoId' });
  };

  return notificacao;
};

export default notificacaoModel;
