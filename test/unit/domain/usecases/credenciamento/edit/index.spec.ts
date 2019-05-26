// tslint:disable:no-magic-numbers
import { getCredenciamentoEditUseCases } from '../../../../../../src/domain/usecases/credenciamento/edit/index';

describe('Domain :: UseCases :: Credenciamento :: Edit :: getCredenciamentoEditUseCases', () => {

  const db = null;
  const mailer = null;
  const mailerSettings = null;

  test('Should return an object with all usecases set', async (done) => {
    try {
      const instance = getCredenciamentoEditUseCases(
        db,
        mailer,
        mailerSettings
      );

      expect(instance).toBeTruthy();

      expect(Object.keys(instance).length).toBe(7);

    } catch (error) {
      expect(error).toBe(null);
    }

    done();
  });

  test('Should return an object with function usecases', async (done) => {
    try {
      const instance = getCredenciamentoEditUseCases(
        db,
        mailer,
        mailerSettings
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
