// tslint:disable:no-magic-numbers
import { getCredenciamentoMutateServices } from '../../../../../../src/domain/services/credenciamento/mutate/index';

describe('Domain :: Services :: Credenciamento :: Mutate :: getCredenciamentoMutateServices', () => {

  const db = null;
  const fileStorage = null;

  test('Should return an object with all services set', async (done) => {
    try {
      const instance = getCredenciamentoMutateServices(
        db,
        fileStorage
      );

      expect(instance).toBeTruthy();

      expect(Object.keys(instance).length).toBe(5);

    } catch (error) {
      expect(error).toBe(null);
    }

    done();
  });

  test('Should return an object with function services', async (done) => {
    try {
      const instance = getCredenciamentoMutateServices(
        db,
        fileStorage
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
