import integrateWithMovideskUseCase from './integrateWithMovideskUseCase';
import { Sequelize } from 'sequelize-database';
import { PersonAPI } from '../../../infra/movidesk';
import { LoggerInterface } from '../../../infra/logging';
import checkParticipantMovideskIntegrationUseCase from './checkParticipantMovideskIntegrationUseCase';
import { getNotificationUseCases } from '../notificacoes';

export interface MovideskUseCases {
  integrateWithMovideskUseCase?: ReturnType<typeof integrateWithMovideskUseCase>;
  checkParticipantMovideskIntegrationUseCase?: ReturnType<typeof checkParticipantMovideskIntegrationUseCase>;
}

export function getMovideskUseCases(
  db: Sequelize,
  personApi: PersonAPI,
  logger: LoggerInterface
) {
  const usecases: MovideskUseCases = {};
  const notificationUseCases = getNotificationUseCases(db);

  usecases.integrateWithMovideskUseCase = integrateWithMovideskUseCase(db, personApi, logger, notificationUseCases);
  usecases.checkParticipantMovideskIntegrationUseCase = checkParticipantMovideskIntegrationUseCase(db);

  return usecases;
}
