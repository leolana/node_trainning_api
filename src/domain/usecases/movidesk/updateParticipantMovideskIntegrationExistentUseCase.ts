import { Sequelize } from 'sequelize-database';
import ParticipanteIntegracaoTipo from '../../entities/ParticipanteIntegracaoTipo';
import ParticipanteIntegracaoStatus from '../../entities/ParticipanteIntegracaoStatus';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';

const updateParticipantMovideskIntegrationExistentUseCase = (
  db: Sequelize
) =>

  /**
   * Atualiza o registro (participanteIntegracao) do tipo (movidesk) para (concluido)
   * Caso não exista o registro, será criado um novo registro com status (concluido).
   *
   * @param participanteId O id do participante integrado.
   * @param uuidIntegracao O uuid do registro criado no Movidesk.
   * @param userEmail Email do usuário responsável pela integração.
   */
  async (
    participanteId: number,
    uuidIntegracao: string,
    userEmail: string
  ) => {

    if (!participanteId || isNaN(participanteId)) {
      throw new Exceptions.InvalidParticipanteIdException();
    }

    if (!uuidIntegracao) {
      throw new Exceptions.MissingMovideskCodeReferenceException();
    }

    const [numberOfAffectedRows] = await db.entities.participanteIntegracao.update(
      {
        id: uuidIntegracao,
        status: ParticipanteIntegracaoStatus.concluido,
        usuario: userEmail
      },
      {
        where: {
          participanteId,
          tipoIntegracao: ParticipanteIntegracaoTipo.movidesk
        }
      }
    );

    if (numberOfAffectedRows === 0) {
      await db.entities.participanteIntegracao.create({
        participanteId,
        id: uuidIntegracao,
        tipoIntegracao: ParticipanteIntegracaoTipo.movidesk,
        status: ParticipanteIntegracaoStatus.concluido,
        usuario: userEmail
      });
    }
  };

export default updateParticipantMovideskIntegrationExistentUseCase;
