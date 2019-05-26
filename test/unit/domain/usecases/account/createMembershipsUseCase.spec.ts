
import database from '../../../../support/database';
import createMembershipUseCase from '../../../../../src/domain/usecases/account/createMembershipUseCase';

describe('Domain :: UseCases :: Account :: createMembershipUseCase', () => {

  database.entities.membro.create = async () => Promise.resolve();
  const expectedError = 'erro-criar-vinculo';

  test('createMembershipUseCase between new participante and user', async (done) => {
    const participanteId = 1;
    const usuarioId = '100000000-0000-0000-0000-000000000000';
    try {
      const createMembership = createMembershipUseCase(database);
      await createMembership(participanteId, usuarioId);

    } catch (error) {
      expect(error).toBe(null);
    }
    done();
  });

  test('createMembershipUseCase between new participante and user adding role', async (done) => {
    const participanteId = 1;
    const usuarioId = '100000000-0000-0000-0000-000000000000';
    const role = 'ESTABELECIMENTO-FINANCEIRO';
    try {
      const createMembership = createMembershipUseCase(database);
      await createMembership(participanteId, usuarioId, role);

    } catch (error) {
      expect(error).toBe(null);
    }
    done();
  });

  test('Invalid data to createMembershipUseCase', async (done) => {
    const participanteId = '2';
    const usuarioId = 1;
    try {
      const createMembership = createMembershipUseCase(database);
      await createMembership(participanteId, usuarioId);

    } catch (error) {
      expect(error.message).toBe(expectedError);
    }
    done();
  });

  test('user not found to create bond', async (done) => {
    const participanteId = '1';
    const usuarioId = '1';
    database.entities.usuario.findOne = async () => null;
    try {
      const createMembership = createMembershipUseCase(database);
      await createMembership(participanteId, usuarioId);

    } catch (error) {
      expect(error.message).toBe(expectedError);
    }
    done();
  });

  test('participante not found to create bond', async (done) => {
    const participanteId = '1';
    const usuarioId = '1';
    database.entities.participante.findOne = async () => null;
    database.entities.usuario.findOne = async () => ({});
    try {
      const createMembership = createMembershipUseCase(database);
      await createMembership(participanteId, usuarioId);

    } catch (error) {
      expect(error.message).toBe(expectedError);
    }
    done();
  });
});
