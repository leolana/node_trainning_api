// tslint:disable:no-magic-numbers
import { getCredenciamentoApproveUseCases } from '../../../../../../src/domain/usecases/credenciamento/approve/index';

describe('Domain :: UseCases :: Credenciamento :: Approve :: getCredenciamentoApproveUseCases', () => {

  const db = null;
  const auth = null;

  test('Should return an object with all usecases set', async (done) => {
    try {
      const instance = getCredenciamentoApproveUseCases(
        db,
        auth
      );

      expect(instance).toBeTruthy();

      expect(Object.keys(instance).length).toBe(3);

    } catch (error) {
      expect(error).toBe(null);
    }

    done();
  });

  test('Should return an object with function usecases', async (done) => {
    try {
      const instance = getCredenciamentoApproveUseCases(
        db,
        auth
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
