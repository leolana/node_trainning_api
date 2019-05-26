import { Sequelize } from 'sequelize-database';
import usuarioNotificacaoEnum from '../../../domain/services/notificacoes/usuarioNotificacaoEnum';

const updateNonReadUseCase = (db: Sequelize) => async (notifications: any[]) => {
  if (!notifications || !notifications.length) {
    return;
  }

  const ids = notifications.map(n => n.id);

  await db.entities.usuarioNotificacao.update({ status: usuarioNotificacaoEnum.lido }, {
    where: { notificacaoId: { $in: ids } },
  });
};

export default updateNonReadUseCase;
