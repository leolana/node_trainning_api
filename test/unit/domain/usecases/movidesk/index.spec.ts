// tslint:disable:no-magic-numbers
import { getMovideskUseCases } from '../../../../../src/domain/usecases/movidesk/index';

describe('Domain :: UseCases :: Movidesk :: getMovideskUseCases', () => {

  const db = null;
  const personApi = null;
  const logger = null;

  test('Should return an object with all usecases set', async (done) => {
    try {
      const instance = getMovideskUseCases(
        db,
        personApi,
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
      const instance = getMovideskUseCases(
        db,
        personApi,
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
