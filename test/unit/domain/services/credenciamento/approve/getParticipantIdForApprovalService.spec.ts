import database from '../../../../../support/database';
import getParticipantIdForApprovalService from '../../../../../../src/domain/services/credenciamento/approve/getParticipantIdForApprovalService';

describe('Domain :: Services :: Credenciamento :: Approve :: getParticipantIdForApprovalService', () => {

  const getParticipantIdForApproval = getParticipantIdForApprovalService(
    database
  );

  test(
    `
      Should set (participanteNovo.id) equal to (participanteExistente.id)
      when there already exists a (participanteExistente)
    `,
    async (done) => {
      try {
        const participanteExistente = {
          id: 7
        };
        const participanteNovo = {
          id: null,
          documento: '123.456.789-00'
        };

        database.entities.participanteExistenteSiscof.findOne = async () => {
          expect('not').toBe('called');
          return {};
        };

        await getParticipantIdForApproval(
          participanteExistente,
          participanteNovo
        );

        expect(participanteNovo.id).toBe(participanteExistente.id);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

  test(
    `
      Should set (participanteNovo.id) equal to the found (participanteExistenteSiscof.participanteId)
      when there is no (participanteExistente) set
    `,
    async (done) => {
      try {
        const participanteExistente = null;
        const participanteNovo = {
          id: null,
          documento: '123.456.789-00'
        };
        const participanteExistenteSiscofFound = {
          participanteId: 95
        };

        database.entities.participanteExistenteSiscof.findOne = async (config: any) => {
          expect(config.where.documento).toBe('12345678900');

          return participanteExistenteSiscofFound;
        };

        await getParticipantIdForApproval(
          participanteExistente,
          participanteNovo
        );

        expect(participanteNovo.id).toBe(participanteExistenteSiscofFound.participanteId);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

  test(
    `
      Shouldn't throw error if the (participanteExistenteSiscof) is not found
    `,
    async (done) => {
      try {
        const participanteExistente = null;
        const participanteNovo = {
          id: null,
          documento: '123.456.789-00'
        };

        database.entities.participanteExistenteSiscof.findOne = async (config: any) => {
          expect(config.where.documento).toBe('12345678900');

          return null;
        };

        await getParticipantIdForApproval(
          participanteExistente,
          participanteNovo
        );

        expect(participanteNovo.id).toBe(null);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

});
