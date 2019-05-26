// tslint:disable:no-magic-numbers
import { getNotificationUseCases } from '../../../../../src/domain/usecases/notificacoes/index';

describe('Domain :: UseCases :: Notificacoes :: getNotificationUseCases', () => {

  const db = null;
  const logger = null;

  test('Should return an object with all usecases set', async (done) => {
    try {
      const instance = getNotificationUseCases(
        db,
        logger
      );

      expect(instance).toBeTruthy();

      expect(Object.keys(instance).length).toBe(6);

    } catch (error) {
      expect(error).toBe(null);
    }

    done();
  });

  test('Should return an object with function usecases', async (done) => {
    try {
      const instance = getNotificationUseCases(
        db,
        logger
      );

      expect(instance).toBeTruthy();

      Object.keys(instance).forEach((methodName) => {
        expect(typeof instance[methodName]).toBe('function');
      });

    } catch (error) {
      expect(error).toBe(null);
    }

    done();
  });

});
