import approveSyncSiscofService from '../../../../../../src/domain/services/credenciamento/approve/approveSyncSiscofService';
import { PreconditionFailedError } from '../../../../../../src/interfaces/rest/errors/ApiErrors';

describe('Domain :: Services :: Credenciamento :: Approve :: approveSyncSiscofService', () => {

  const siscofWrapper: any = {};

  const logger: any = {
    info: async () => null,
    error: async () => null
  };

  const approveSyncSiscof = approveSyncSiscofService(siscofWrapper, logger);

  test('Should throw custom exception if there is no participanteNovo.id', async (done) => {
    try {
      const participanteNovo = {
        id: undefined
      };

      await approveSyncSiscof(
        participanteNovo
      );

      expect('not').toBe('here');

    } catch (error) {
      expect(error.message).toBe('invalid-participante-id');
    }

    done();
  });

  test('Should throw custom exception if there is no participanteNovo.documento', async (done) => {
    try {
      const participanteNovo = {
        id: 1,
        documento: undefined
      };

      await approveSyncSiscof(
        participanteNovo
      );

      expect('not').toBe('here');

    } catch (error) {
      expect(error.message).toBe('missing-document');
    }

    done();
  });

  test(
    `
      Shouldn't throw errors when (siscofWrapper.incluirParticipante) breaks
    `,
    async (done) => {
      try {
        const participanteNovo = {
          id: 1,
          documento: '123.456.789-00',
          credenciamento: {
            taxaContratual: 0
          },
          taxaContratual: {}
        };

        siscofWrapper.incluirParticipante = async () => {
          throw new PreconditionFailedError('...');
        };

        await approveSyncSiscof(
          participanteNovo
        );

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

  test(
    `
      Shouldn't throw errors when (siscofWrapper.incluirParticipante) works as well
    `,
    async (done) => {
      try {
        const participanteNovo = {
          id: 1,
          documento: '123.456.789-00',
          credenciamento: {
            taxaContratual: 0
          },
          taxaContratual: 0
        };

        siscofWrapper.incluirParticipante = async (participante: any, ehEstabelecimento: boolean) => {
          expect(participanteNovo.taxaContratual).toBe(participanteNovo.credenciamento.taxaContratual);
          expect(participante).toBe(participanteNovo);
          expect(ehEstabelecimento).toBe(true);
        };

        await approveSyncSiscof(
          participanteNovo
        );

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

});
