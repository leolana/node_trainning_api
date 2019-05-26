import * as uuid from 'uuid';

import database from '../../../../support/database';
import deleteInvite from '../../../../../src/domain/usecases/account/deleteInvite';

describe('Domain :: UseCases :: Account :: DeleteInvite', () => {
  const transaction = database.transaction = async () => ({
    commit: async () => null,
    rollback: async () => null
  });

  test('DeleteInvite with code valid', async (done) => {
    const deleteInviteUseCase = deleteInvite(database);
    const deleted = await deleteInviteUseCase('00000000-0000-0000-0000-000000000000', transaction);

    expect(!deleted).toBe(true);
    done();
  });

  test('DeleteInvite with code not registered in factory should throw error invite-not-found', async (done) => {
    database.entities.usuarioConvite.findOne = async () => {
      return null;
    };

    const deleteInviteUseCase = deleteInvite(database);

    try {
      await deleteInviteUseCase(uuid.v1(), transaction);
      expect(false).toBe(true);
    } catch (error) {
      expect(error.message).toBe('invite-not-found');
    }

    done();
  });
});
