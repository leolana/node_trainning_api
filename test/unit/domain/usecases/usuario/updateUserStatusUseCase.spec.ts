import updateUserStatusUseCase from '../../../../../src/domain/usecases/usuario/updateUserStatusUseCase';
import database from '../../../../support/database';
import dataFaker from '../../../../../test/support/dataFaker';

describe('Domain :: UseCases :: Usuario :: UpdateUserStatus', () => {
  database.transaction = async () => ({ rollback: async () => null, commit: async () => null });

  const auth: any = { updateUserStatus: async () => null };
  const logger: any = { info: () => 0 };
  const updateUserStatus = updateUserStatusUseCase(database, auth, logger);

  test('If user is not found in database, should be thrown specific exception', async (done) => {
    database.entities.usuario.findOne = async () => null;

    try {
      const userId = dataFaker.guid();
      const userStatus = true;
      const email = 'alpe@alpe.com.br';

      await updateUserStatus(userId, userStatus, email);
      expect('not').toBe('here');
    } catch (error) {
      expect(error.message).toBe('usuario-not-found');
    }
    done();
  });

  test('When everything works as expected, no error is thrown', async (done) => {
    database.entities.usuario.findOne = async () => ({ update: async () => ({}) });

    try {
      const userId = dataFaker.guid();
      const userStatus = true;
      const email = 'alpe@alpe.com.br';

      await updateUserStatus(userId, userStatus, email);
      expect('done').toBe('done');
    } catch (error) {
      expect(error).toBe(null);
    }
    done();
  });

});
