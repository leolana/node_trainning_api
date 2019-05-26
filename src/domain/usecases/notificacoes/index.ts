import { Sequelize } from 'sequelize-database';
import { LoggerInterface } from '../../../infra/logging';

import getNotificationsUseCase from './getNotificationsUseCase';
import updateNonReadUseCase from './updateNonReadUseCase';
import addNotificationUseCase from './addNotificationUseCase';
import getNotificationNonReadUseCase from './getNotificationNonReadUseCase';
import createNotificationMovideskIntegrationFailedUseCase from './createNotificationMovideskIntegrationFailedUseCase';
import createNotificationMovideskIntegrationSuccessUseCase from './createNotificationMovideskIntegrationSuccessUseCase';

export interface NotificationUseCases {
  getNotificatons?: ReturnType<typeof getNotificationsUseCase>;
  updateNonRead?: ReturnType<typeof updateNonReadUseCase>;
  addNotification?: ReturnType<typeof addNotificationUseCase>;
  getNotificationNonRead?: ReturnType<typeof getNotificationNonReadUseCase>;
  createNotificationMovideskIntegrationFailed?: ReturnType<typeof createNotificationMovideskIntegrationFailedUseCase>;
  createNotificationMovideskIntegrationSuccess?: ReturnType<typeof createNotificationMovideskIntegrationSuccessUseCase>;
}

export function getNotificationUseCases(
  db: Sequelize,
  logger: LoggerInterface
) {
  const usecases: NotificationUseCases = {};

  usecases.getNotificatons = getNotificationsUseCase(db);
  usecases.updateNonRead = updateNonReadUseCase(db);
  usecases.addNotification = addNotificationUseCase(db);
  usecases.getNotificationNonRead = getNotificationNonReadUseCase(db);

  usecases.createNotificationMovideskIntegrationFailed = createNotificationMovideskIntegrationFailedUseCase(
    db,
    usecases,
    logger
  );

  usecases.createNotificationMovideskIntegrationSuccess = createNotificationMovideskIntegrationSuccessUseCase(
    usecases,
    logger
  );

  return usecases;
}
