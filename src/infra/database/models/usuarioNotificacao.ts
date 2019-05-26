import { Sequelize, DataTypes } from 'sequelize-database';
import usuarioNotificacaoEnum from '../../../domain/services/notificacoes/usuarioNotificacaoEnum';

const usuarioNotificacaoModel = (sequelize: Sequelize, dataTypes: DataTypes) => {

  const usuarioNotificacao = sequelize.define(
    'usuarioNotificacao',
    {
      notificacaoId: {
        type: dataTypes.INTEGER,
        allowNull: false,
      },
      usuarioId: {
        type: dataTypes.UUID,
        allowNull: false,
      },
      status: {
        type: dataTypes.INTEGER,
        allowNull: false,
        defaultValue: usuarioNotificacaoEnum.naoLido,
        validate: {
          isIn: [<any[]>Object.values(usuarioNotificacaoEnum)]
        }
      }
    }
  );

  usuarioNotificacao.associate = (models) => {
    const { usuario, notificacao } = models;

    usuarioNotificacao.belongsTo(usuario, { foreignKey: 'usuarioId' });
    usuarioNotificacao.belongsTo(notificacao, { foreignKey: 'notificacaoId' });
  };

  return usuarioNotificacao;
};

export default usuarioNotificacaoModel;
