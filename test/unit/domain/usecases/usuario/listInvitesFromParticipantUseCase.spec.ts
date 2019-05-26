import listInvitesFromParticipantUseCase
  from '../../../../../src/domain/usecases/usuario/listInvitesFromParticipantUseCase';
import database from '../../../../support/database';

describe('Domain :: UseCases :: Usuario :: ListInvitesFromParticipant', () => {

  const listInvitesFromParticipant = listInvitesFromParticipantUseCase(database);

  test('returns array', async (done) => {
    database.entities.usuarioConvite.findAll = (): any => {
      return Promise.resolve([]);
    };

    const idParticipant = 42;
    const convites = await listInvitesFromParticipant(idParticipant);

    expect(Array.isArray(convites)).toBe(true);
    done();
  });

});
