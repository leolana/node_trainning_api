// tslint:disable:no-magic-numbers
import { getCredenciamentoApproveServices } from '../../../../../../src/domain/services/credenciamento/approve/index';

describe('Domain :: Services :: Credenciamento :: Approve :: getCredenciamentoApproveServices', () => {

  const db = null;
  const siscofWrapper = null;
  const logger = null;

  test('Should return an object with all services set', async (done) => {
    try {
      const instance = getCredenciamentoApproveServices(
        db,
        siscofWrapper,
        logger
      );

      expect(instance).toBeTruthy();

      expect(Object.keys(instance).length).toBe(10);

    } catch (error) {
      expect(error).toBe(null);
    }

    done();
  });

  test('Should return an object with function services', async (done) => {
    try {
      const instance = getCredenciamentoApproveServices(
        db,
        siscofWrapper,
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
