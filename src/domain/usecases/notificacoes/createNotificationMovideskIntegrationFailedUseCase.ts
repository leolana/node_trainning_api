import { DateTime } from 'luxon';
import { Sequelize } from 'sequelize-database';
import { NotificationUseCases } from './index';
import { getTipoDocumento, getSiglaParticipante } from '../../services/participante/personTypeEnum';
import notificacaoCategoriaEnum from '../../services/notificacoes/notificacaoCategoriaEnum';
import usuarioNotificacaoEnum from '../../services/notificacoes/usuarioNotificacaoEnum';
import rolesEnum from '../../services/auth/rolesEnum';
import { LoggerInterface } from '../../../infra/logging';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';

const createNotificationMovideskIntegrationFailedUseCase = (
  db: Sequelize,
  notificationUseCases: NotificationUseCases,
  logger: LoggerInterface
) =>

  /**
   * Salva uma notificação para avisar que houve falha na integração do (participante) com o Movidesk
   *
   * @param participante O objeto no formato da model do postgres com os dados do Participante
   * @param userEmail Email do usuário responsável pela integração que falhou
   */
  async (
    participante: any,
    userEmail: string
  ) => {
    try {

      if (!participante) {
        throw new Exceptions.MissingParticipantException();
      }

      const ehFornecedor = await db.entities.participanteFornecedor.findOne({
        where: {
          participanteId: participante.id
        }
      });

      const tipoParticipante = getSiglaParticipante(ehFornecedor);

      const roles = [rolesEnum.boAdministrador];
      const tipoDocumento = getTipoDocumento(participante.documento);

      const notification = {
        categoriaId: notificacaoCategoriaEnum.movidesk,
        mensagem: `Falha ao integrar o participante ${participante.nome}`
          + ` (${tipoParticipante}: ${participante.id} ${tipoDocumento}: ${participante.documento})`,

        dataExpiracao: DateTime.local().plus({ days: 5 }).toSQLDate(),
        usuarioNotificacao: {
          status: usuarioNotificacaoEnum.naoLido,
        }
      };

      await notificationUseCases.addNotification(
        notification,
        roles,
        userEmail
      );

    } catch (e) {
      logger.warn('Houve um erro ao salvar notificação de falha na Integração do Movidesk, mas não foi impeditivo.');
      logger.error(e);
    }

  };

export default createNotificationMovideskIntegrationFailedUseCase;
