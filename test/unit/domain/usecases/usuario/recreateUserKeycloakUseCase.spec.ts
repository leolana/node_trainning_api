import recreateUserKeycloakUseCase from '../../../../../src/domain/usecases/usuario/recreateUserKeycloakUseCase';
import database from '../../../../support/database';
import dataFaker from '../../../../support/dataFaker';

describe('Domain :: UseCases :: Usuario :: RecreateUserKeycloak', () => {
  database.transaction = async () => ({ rollback: async () => null, commit: async () => null });

  const auth: any = {
    recreateUser() {
      const userId = dataFaker.guid();
      return Promise.resolve(userId);
    }
  };
  const logger: any = { info: () => 0 };

  const recreateUserKeycloak = recreateUserKeycloakUseCase(database, auth, logger);

  test('Recreate user keycloak', async (done) => {
    const dataUser = {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'teste@itlab.com.br',
    };

    try {
      await recreateUserKeycloak(dataUser, dataUser.email);
      expect('done').toBe('done');
    } catch (error) {
      expect(error).toBe(null);
    }

    done();
  });

  test('Recreate user keycloak when user doesnt exist should throw usuario-not-found', async (done) => {
    const dataUser = {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'teste@itlab.com.br',
    };

    try {
      database.entities.usuario.findOne = async () => null;
      await recreateUserKeycloak(dataUser, dataUser.email);
      expect(false).toBe(true);
    } catch (error) {
      expect(error.message).toBe('usuario-not-found');
    }

    done();
  });

});
