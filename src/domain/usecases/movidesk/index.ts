import { Sequelize } from 'sequelize-database';
import { PersonAPI } from '../../../infra/movidesk';
import { LoggerInterface } from '../../../infra/logging';
import { getNotificationUseCases } from '../notificacoes';

import forceMovideskPersonIntegrationUseCase from './forceMovideskPersonIntegrationUseCase';
import checkMovideskPersonIntegrationUseCase from './checkMovideskPersonIntegrationUseCase';
import mapMovideskPersonDataFromParticipanteUseCase from './mapMovideskPersonDataFromParticipanteUseCase';
import sendParticipantToMovideskUseCase from './sendParticipantToMovideskUseCase';
import updateParticipantMovideskIntegrationExistentUseCase from './updateParticipantMovideskIntegrationExistentUseCase';
import checkParticipantAccessToChatboxUseCase from './checkParticipantAccessToChatboxUseCase';

export interface MovideskUseCases {
  forceMovideskPersonIntegration?: ReturnType<typeof forceMovideskPersonIntegrationUseCase>;
  checkMovideskPersonIntegration?: ReturnType<typeof checkMovideskPersonIntegrationUseCase>;
  mapMovideskPersonDataFromParticipante?: typeof mapMovideskPersonDataFromParticipanteUseCase;
  sendParticipantToMovidesk?: ReturnType<typeof sendParticipantToMovideskUseCase>;
  updateParticipantMovideskIntegrationExistent?: ReturnType<typeof updateParticipantMovideskIntegrationExistentUseCase>;
  checkParticipantAccessToChatbox?: ReturnType<typeof checkParticipantAccessToChatboxUseCase>;
}

export function getMovideskUseCases(
  db: Sequelize,
  personApi: PersonAPI,
  logger: LoggerInterface
) {
  const usecases: MovideskUseCases = {};
  const notificationUseCases = getNotificationUseCases(db, logger);

  usecases.forceMovideskPersonIntegration = forceMovideskPersonIntegrationUseCase(
    db,
    logger,
    notificationUseCases,
    usecases
  );

  usecases.checkMovideskPersonIntegration = checkMovideskPersonIntegrationUseCase(
    personApi,
    logger
  );

  usecases.mapMovideskPersonDataFromParticipante = mapMovideskPersonDataFromParticipanteUseCase;

  usecases.sendParticipantToMovidesk = sendParticipantToMovideskUseCase(
    usecases,
    personApi
  );

  usecases.updateParticipantMovideskIntegrationExistent = updateParticipantMovideskIntegrationExistentUseCase(
    db
  );

  usecases.checkParticipantAccessToChatbox = checkParticipantAccessToChatboxUseCase(
    db,
    usecases,
    logger
  );

  return usecases;
}
