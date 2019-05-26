import { DateTime } from 'luxon';
import { NotificationUseCases } from './index';
import { LoggerInterface } from '../../../infra/logging';
import notificacaoCategoriaEnum from '../../services/notificacoes/notificacaoCategoriaEnum';
import usuarioNotificacaoEnum from '../../services/notificacoes/usuarioNotificacaoEnum';
import rolesEnum from '../../services/auth/rolesEnum';

const createNotificationMovideskIntegrationSuccessUseCase = (
  notificationUseCases: NotificationUseCases,
  logger: LoggerInterface
) =>

  /**
   * Salva uma notificação para avisar que a integração do (participante) com o Movidesk foi bem sucedida
   *
   * @param userEmail Email do usuário responsável pela integração que falhou
   * @param participanteId O Id do Participante que foi integrado no Movidesk
   */
  async (
    userEmail: string,
    participanteId: number
  ) => {
    try {

      const notification = {
        categoriaId: notificacaoCategoriaEnum.movidesk,
        dataExpiracao: DateTime.local().plus({ days: 5 }).toSQLDate(),
        usuarioNotificacao: {
          status: usuarioNotificacaoEnum.naoLido,
        }
      };

      const roles = [rolesEnum.boAdministrador];

      await notificationUseCases.addNotification(
        notification,
        roles,
        userEmail,
        participanteId
      );

    } catch (ex) {
      logger.info('Houve um erro ao salvar notificação de sucesso da Integração Movidesk, mas não foi impeditivo.');
      logger.error(ex);
    }

  };

export default createNotificationMovideskIntegrationSuccessUseCase;
