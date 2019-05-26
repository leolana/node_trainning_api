import { Sequelize } from 'sequelize-database';
import { LoggerInterface } from '../../../infra/logging';
import { MovideskUseCases } from './index';
import { MovideskPerson } from '../../../infra/movidesk/PersonTypes';
import ParticipanteIntegracaoTipo from '../../entities/ParticipanteIntegracaoTipo';
import ParticipanteIntegracaoStatus from '../../entities/ParticipanteIntegracaoStatus';

const checkParticipantAccessToChatboxUseCase = (
  db: Sequelize,
  movideskUsecases: MovideskUseCases,
  logger: LoggerInterface
) =>

  /**
   * Busca se o participante está integrado (true|false) no Movidesk.
   * Se integrado (true), devolve também seu (uuidIntegracao)
   * Se integrado (false), atualiza (participanteIntegracao.status) para (cancelado).
   *
   * @param participanteId O Id do Participante para checar se pode ver o chatbox.
   * @param isParticipante Se é Estabelecimento ou Fornecedor (true|false).
   * @param userEmail O email do usuário logado
   * @param userName O nome do usuário logado
   */
  async (
    participanteId: number,
    isParticipante: boolean,
    userEmail: string,
    userName: string
  ) => {

    let participante = null;
    let existing: MovideskPerson = null;

    if (isParticipante) {
      participante = await db.entities.participante.findOne({
        where: { id: participanteId }
      });

      try {
        existing = await movideskUsecases.checkMovideskPersonIntegration(
          participante.id,
          participante.documento
        );
      } catch (error) {
        logger.error(error);
      }

      if (!existing) {
        await db.entities.participanteIntegracao.update(
          {
            status: ParticipanteIntegracaoStatus.cancelado
          },
          {
            where: {
              participanteId,
              tipoIntegracao: ParticipanteIntegracaoTipo.movidesk
            }
          }
        );
      }
    }

    return {
      integrado: !!existing,
      uuidIntegracao: existing && existing.id,
      participanteId: participante && participante.id,
      email: userEmail,
      nome: userName
    };
  };

export default checkParticipantAccessToChatboxUseCase;
