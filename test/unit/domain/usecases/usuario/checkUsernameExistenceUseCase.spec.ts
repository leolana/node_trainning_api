import checkUsernameExistenceUseCase from '../../../../../src/domain/usecases/usuario/checkUsernameExistenceUseCase';
import database from '../../../../support/database';

describe('Domain :: UseCases :: Usuario :: CheckUsernameExistence', () => {

  const checkUsername = checkUsernameExistenceUseCase(database);

  test('Check username when pass username', async (done) => {
    const idUsuario = '00000000-0000-0000-0000-000000000000';
    const username = 'teste';

    const result = await checkUsername(idUsuario, username);
    expect(Array.isArray(result)).toBe(true);

    done();
  });

  test('Check username when dont pass username', async (done) => {
    const idUsuario = '00000000-0000-0000-0000-000000000000';

    const result = await checkUsername(idUsuario, null);
    expect(result).toBe(null);

    done();
  });

});
