import database from '../../../../support/database';
import updateNonReadUseCase from '../../../../../src/domain/usecases/notificacoes/updateNonReadUseCase';

describe('Domain :: UseCases :: Notification :: updateNotificationsNonRead', () => {

  const updateNonRead = updateNonReadUseCase(database);

  test('Should not throw error if no notifications array is present', async (done) => {
    try {
      const notifications = null;
      await updateNonRead(notifications);

      expect('done').toBe('done');
    } catch (error) {
      expect(error).toBe(null);
    }

    done();
  });

  test('Should work with array as well', async (done) => {
    try {
      const notifications = [{ id: 1 }];
      await updateNonRead(notifications);

      expect('done').toBe('done');
    } catch (error) {
      expect(error).toBe(null);
    }

    done();
  });

});
