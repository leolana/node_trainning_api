import listUsersFromParticipantUseCase
  from '../../../../../src/domain/usecases/usuario/listUsersFromParticipantUseCase';
import database from '../../../../support/database';

describe('Domain :: UseCases :: Usuario :: ListUsersFromParticipant', () => {

  database.entities.membro.findAll = (): any => {
    return Promise.resolve([]);
  };

  const listUsersFromParticipant = listUsersFromParticipantUseCase(database);

  test('returns array', async (done) => {
    const idParticipant = 42;
    const usuarios = await listUsersFromParticipant(idParticipant);

    expect(Array.isArray(usuarios)).toBe(true);
    done();
  });

});
