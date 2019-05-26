import database from '../../../../support/database';
import getNotificationsUseCase from '../../../../../src/domain/usecases/notificacoes/getNotificationsUseCase';

describe('Domain :: UseCases :: Notification :: getNotification', () => {
  const getNotification = getNotificationsUseCase(database);

  test('Get Notifications with user id correct', async (done) => {
    const page = 1;
    const limit = 20;
    const objUser = { id: '00000000-0000-0000-0000-000000000000' };
    const notification = await getNotification(page, limit, objUser);

    expect(notification).toBeTruthy();
    done();
  });

});
