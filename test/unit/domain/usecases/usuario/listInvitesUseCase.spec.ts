import listInvitesUseCase from '../../../../../src/domain/usecases/usuario/listInvitesUseCase';
import database from '../../../../support/database';
import usuarioStatus from '../../../../../src/domain/entities/usuarioStatus';

describe('Domain :: UseCases :: Usuario :: ListInvites', () => {

  const listInvites = listInvitesUseCase(database);

  test('happy path', async (done) => {

    database.entities.usuarioConvite.findAll = (): any => {
      return Promise.resolve([]);
    };

    const participanteId = 1;
    const status = usuarioStatus.convidado;

    const result = await listInvites(participanteId, status);
    expect(Array.isArray(result)).toBe(true);

    done();
  });

});
