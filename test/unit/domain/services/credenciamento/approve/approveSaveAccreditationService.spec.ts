import approveSaveAccreditationService from '../../../../../../src/domain/services/credenciamento/approve/approveSaveAccreditationService';

describe('Domain :: Services :: Credenciamento :: Approve :: approveSaveAccreditationService', () => {

  test('Should throw custom exception if there is no participanteNovo', async (done) => {
    try {
      const credenciamento = {};
      const participanteNovo = null;

      await approveSaveAccreditationService(
        credenciamento,
        participanteNovo,
        null
      );

      expect('not').toBe('here');

    } catch (error) {
      expect(error.message).toBe('invalid-participante-id');
    }

    done();
  });

  test('Should throw custom exception if there is no participanteNovo.id', async (done) => {
    try {
      const credenciamento = {};
      const participanteNovo = { id: null };

      await approveSaveAccreditationService(
        credenciamento,
        participanteNovo,
        null
      );

      expect('not').toBe('here');

    } catch (error) {
      expect(error.message).toBe('invalid-participante-id');
    }

    done();
  });

  test('Shouldn\'t call save method if both ids are already the same', async (done) => {
    try {
      const credenciamento = {
        participanteId: 1,
        save: async () => {
          expect('this function').toBe('ignored');
        }
      };
      const participanteNovo = { id: 1 };

      await approveSaveAccreditationService(
        credenciamento,
        participanteNovo,
        null
      );

    } catch (error) {
      expect(error).toBe(null);
    }

    done();
  });

  test('Should call save method when ids are not equal', async (done) => {
    try {
      const credenciamento = {
        participanteId: undefined,
        save: async (config: any) => {
          expect(config).toHaveProperty('transaction');
        }
      };
      const participanteNovo = { id: 1 };

      await approveSaveAccreditationService(
        credenciamento,
        participanteNovo,
        null
      );

      expect(credenciamento.participanteId).toBe(participanteNovo.id);

    } catch (error) {
      expect(error).toBe(null);
    }

    done();
  });

});
