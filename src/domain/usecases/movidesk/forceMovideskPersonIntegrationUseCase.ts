import { Sequelize } from 'sequelize-database';
import { LoggerInterface } from '../../../infra/logging';
import { NotificationUseCases } from '../notificacoes';
import { MovideskUseCases } from './index';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';

const forceMovideskPersonIntegrationUseCase = (
  db: Sequelize,
  logger: LoggerInterface,
  notificationUseCases: NotificationUseCases,
  movideskUseCases: MovideskUseCases
) =>

  /**
   * Encontra o participante no postgres com suas associações.
   * Verifica se o (participante.id) + (participante.documento) já existe no Movidesk.
   * Cria se não existir. Reflete no postgres que a integração está (concluida).
   * Cria notificações de sucesso/falha na Integração.
   *
   * @param participanteId O id do participante que se está tentando integrar.
   * @param userEmail O email do usuário responsável pela integração.
   * @param throwErrors Se for setado false, qualquer erro será apenas logado,
   * e não causará estouro de exception pra quem chamou.
   */
  async (
    participanteId: number,
    userEmail: string,
    throwErrors = true
  ) => {
    let participante = null;

    try {
      if (!participanteId || isNaN(participanteId)) {
        throw new Exceptions.InvalidParticipanteIdException();
      }

      participante = await db.entities.participante.findOne({
        where: { id: participanteId },
        include: [{
          model: db.entities.cidade,
          as: 'cidade'
        }, {
          model: db.entities.participanteContato,
          as: 'contatos'
        }]
      });

      if (!participante) {
        throw new Exceptions.ParticipanteNotFoundException();
      }

      let existing = await movideskUseCases.checkMovideskPersonIntegration(
        participante.id,
        participante.documento
      );

      if (!existing) {
        existing = await movideskUseCases.sendParticipantToMovidesk(
          participante,
          userEmail
        );
      }

      await movideskUseCases.updateParticipantMovideskIntegrationExistent(
        participante.id,
        existing.id,
        userEmail
      );

      await notificationUseCases.createNotificationMovideskIntegrationSuccess(
        userEmail,
        participante.id
      );

    } catch (error) {

      await notificationUseCases.createNotificationMovideskIntegrationFailed(
        participante,
        userEmail
      );

      if (throwErrors) {
        throw error;
      }

      logger.info('Houve um erro na Integração com o Movidesk, mas não foi impeditivo.');
      logger.error(error);
    }
  };

export default forceMovideskPersonIntegrationUseCase;
