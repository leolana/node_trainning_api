import getNotificationsUseCase from './getNotificationsUseCase';
import updateNonReadUseCase from './updateNonReadUseCase';
import addNotificationUseCase from './addNotificationUseCase';
import getNotificationNonReadUseCase from './getNotificationNonReadUseCase';

export interface NotificationUseCases {
  getNotificatons?: ReturnType<typeof getNotificationsUseCase>;
  updateNonRead?: ReturnType<typeof updateNonReadUseCase>;
  addNotification?: ReturnType<typeof addNotificationUseCase>;
  getNotificationNonRead?: ReturnType<typeof getNotificationNonReadUseCase>;
}

export function getNotificationUseCases(db) {
  const usecases: NotificationUseCases = {};

  usecases.getNotificatons = getNotificationsUseCase(db);
  usecases.updateNonRead = updateNonReadUseCase(db);
  usecases.addNotification = addNotificationUseCase(db);
  usecases.getNotificationNonRead = getNotificationNonReadUseCase(db);

  return usecases;
}
