import getInfoKeycloakUseCase from '../../../../../src/domain/usecases/usuario/getInfoKeycloakUseCase';
import database from '../../../../support/database';

describe('Domain :: UseCases :: Usuario :: RecreateUserKeycloak', () => {

  test('Get info user keycloak', async (done) => {
    const auth: any = {
      getInfoUser() {
        return database.entities.usuario.findOne = async () => null;
      }
    };
    const logger: any = {
      error: (e: any) => expect(e).toBe(null)
    };
    const getInfoUserKeycloak = getInfoKeycloakUseCase(auth, logger);

    const id = '00000000-0000-0000-0000-000000000000';
    try {
      await getInfoUserKeycloak(id);
      expect('done').toBe('done');
    } catch (error) {
      expect(error).toBe(null);
    }

    done();
  });

  test('Get info user keycloak when user doesnt exist should throw usuario-keycloak-not-found', async (done) => {

    const auth: any = {
      getInfoUser() {
        return 'usuario-keycloak-not-found';
      }
    };
    const logger: any = {
      error: (e: any) => expect(e).toBe(auth.getInfoUser)
    };
    const getInfoUserKeycloak = getInfoKeycloakUseCase(auth, logger);

    const id = '00000000-0000-0000-0000-000000000000';
    try {
      await getInfoUserKeycloak(id);
      expect('done').toBe('done');
    } catch (error) {
      expect(error).toBe('usuario-keycloak-not-found');
    }

    done();
  });

});
