import { Sequelize } from 'sequelize-database';
import usuarioNotificacaoEnum from '../../../domain/services/notificacoes/usuarioNotificacaoEnum';
import { DateTime } from 'luxon';

const getNotificationNonReadUseCase = (db: Sequelize) => async (userEmail: string) => {
  const user = await db.entities.usuario.findOne({
    attributes: ['id'],
    where: { email: userEmail }
  });

  if (!user) {
    return {
      count: 0,
      rows: [0]
    };
  }

  const today = DateTime.local().toSQLDate();

  const result = await db.entities.notificacao.findAndCountAll({
    where: {
      dataExpiracao: { $gte: today }
    },
    include: [
      {
        model: db.entities.notificacaoCategoria,
        where: { ativo: true },
      },
      {
        model: db.entities.usuarioNotificacao,
        where: { usuarioId: user.id, status: usuarioNotificacaoEnum.naoLido },
        as: 'usuarioNotificacao'
      },
    ]
  });

  return result;
};

export default getNotificationNonReadUseCase;
