import { Sequelize } from 'sequelize-database';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import ParticipanteIntegracaoTipo from '../../entities/ParticipanteIntegracaoTipo';
import ParticipanteIntegracaoStatus from '../../entities/ParticipanteIntegracaoStatus';
import { config } from '../../../config';

const checkParticipantMovideskIntegrationUseCase = (db: Sequelize) => async (participanteId: number) => {
  if (!config.movidesk.enabled) return false;
  if (isNaN(participanteId)) {
    throw new Exceptions.InvalidParticipanteIdException();
  }

  const integrado = await db.entities.participanteIntegracao.findOne({
    where: {
      participanteId,
      tipoIntegracao: ParticipanteIntegracaoTipo.movidesk,
      status: ParticipanteIntegracaoStatus.concluido
    }
  });

  return !!integrado;
};

export default checkParticipantMovideskIntegrationUseCase;
