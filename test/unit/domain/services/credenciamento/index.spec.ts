// tslint:disable:no-magic-numbers
import { getCredenciamentoServices } from '../../../../../src/domain/services/credenciamento/index';

describe('Domain :: Services :: Credenciamento :: getCredenciamentoServices', () => {

  const db = null;
  const siscofWrapper = null;
  const fileStorage = null;
  const logger = null;

  test('Should return an object with all services set', async (done) => {
    try {
      const instance = getCredenciamentoServices(
        db,
        siscofWrapper,
        fileStorage,
        logger
      );

      expect(instance).toBeTruthy();

      expect(Object.keys(instance).length).toBe(8);

    } catch (error) {
      expect(error).toBe(null);
    }

    done();
  });

  test('Should return an object with function services', async (done) => {
    try {
      const instance = getCredenciamentoServices(
        db,
        siscofWrapper,
        fileStorage,
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
