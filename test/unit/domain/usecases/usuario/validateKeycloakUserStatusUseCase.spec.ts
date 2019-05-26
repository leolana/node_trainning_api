import validateKeycloakUserStatusUseCase from '../../../../../src/domain/usecases/usuario/validateKeycloakUserStatusUseCase';
import database from '../../../../support/database';
import dataFaker from '../../../../../test/support/dataFaker';

describe('Domain :: UseCases :: Usuario :: ValidateKeycloakUserStatus', () => {

  const auth: any = {};
  const validateKeycloakUserStatus = validateKeycloakUserStatusUseCase(database, auth);

  test('If user is not found in database, should be thrown specific exception', async (done) => {
    database.entities.usuario.findOne = async () => null;

    try {
      const userId = dataFaker.guid();
      await validateKeycloakUserStatus(userId);

      expect('not').toBe('here');
    } catch (error) {
      expect(error.message).toBe('usuario-not-found');
    }
    done();
  });

  test('If user is not found in Keycloak, should be thrown specific exception', async (done) => {
    database.entities.usuario.findOne = async () => ({});
    auth.getUser = async () => null;

    try {
      const userId = dataFaker.guid();
      await validateKeycloakUserStatus(userId);

      expect('not').toBe('here');
    } catch (error) {
      expect(error.message).toBe('usuario-keycloak-not-found');
    }
    done();
  });

  test('When everything works as expected, no error is thrown', async (done) => {
    database.entities.usuario.findOne = async () => ({ ativo: true });
    auth.getUser = async () => ({});
    auth.putUser = async () => null;

    try {
      const userId = dataFaker.guid();
      await validateKeycloakUserStatus(userId);

      expect('done').toBe('done');
    } catch (error) {
      expect(error).toBe(null);
    }
    done();
  });

});
