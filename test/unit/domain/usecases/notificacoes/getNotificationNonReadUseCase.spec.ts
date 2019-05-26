import database from '../../../../support/database';
import getNotificationNonReadUseCase from '../../../../../src/domain/usecases/notificacoes/getNotificationNonReadUseCase';

describe('Domain :: UseCases :: Notification :: getNotificationNonRead', () => {
  const getNotificationNonRead = getNotificationNonReadUseCase(database);

  test('Get Notifications nonread with User email correct', async (done) => {
    const email = 'alpe@alpe.com.br';
    const notification = await getNotificationNonRead(email);

    expect(notification).toBeTruthy();
    done();
  });

});
