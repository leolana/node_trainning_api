import listUsersUseCase from '../../../../../src/domain/usecases/usuario/listUsersUseCase';
import database from '../../../../support/database';
import usuarioStatus from '../../../../../src/domain/entities/usuarioStatus';

describe('Domain :: UseCases :: Usuario :: ListUsers', () => {

  const listUsers = listUsersUseCase(database);

  test('happy path', async (done) => {

    database.entities.usuario.findAll = (): any => {
      return Promise.resolve([]);
    };

    const participanteId = 1;
    const status = usuarioStatus.ativo;

    const result = await listUsers(participanteId, status);
    expect(Array.isArray(result)).toBe(true);

    done();
  });

});
