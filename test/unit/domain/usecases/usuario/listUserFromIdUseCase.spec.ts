import listUserFromIdUseCase from '../../../../../src/domain/usecases/usuario/listUserFromIdUseCase';
import database from '../../../../support/database';

describe('Domain :: UseCases :: Usuario :: ListUsersFromId', () => {

  const listUser = listUserFromIdUseCase(database);

  test('ListUser when user exist', async (done) => {
    const idUsuario = '00000000-0000-0000-0000-000000000000';

    const result = await listUser(idUsuario);
    expect(typeof result === 'object').toBe(true);

    done();
  });

  test('ListUser when user doesnt exist should throw usuario-not-found', async (done) => {

    database.entities.usuario.findOne = (): any => {
      return null;
    };
    const idUsuario = '00000000-0000-0000-0000-000000000000';

    try {
      await listUser(idUsuario);
      expect(false).toBe(true);
    } catch (error) {
      expect(error.message).toBe('usuario-not-found');
    }

    done();
  });

});
