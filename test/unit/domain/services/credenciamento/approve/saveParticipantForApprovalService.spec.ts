import saveParticipantForApprovalService from '../../../../../../src/domain/services/credenciamento/approve/saveParticipantForApprovalService';

describe('Domain :: Services :: Credenciamento :: Approve :: saveParticipantForApprovalService', () => {

  test(
    `
      Should call the (updateParticipantForApproval) service when (participanteExistente) exists
    `,
    async (done) => {
      try {
        const participanteNovo = {};
        const participanteExistente = {};

        const credenciamentoApproveServices: any = {
          updateParticipantForApproval: async (model: any) => {
            expect(model).toBe(participanteNovo);
          },
          createParticipantForApproval: async () => {
            expect('not').toBe('here');
          }
        };

        const saveParticipantForApproval = saveParticipantForApprovalService(
          credenciamentoApproveServices
        );

        const result = await saveParticipantForApproval(
          participanteNovo,
          participanteExistente,
          null
        );

        expect(result).toBe(participanteNovo);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

  test(
    `
      Should call the (createParticipantForApproval) service when (participanteExistente) is not set
    `,
    async (done) => {
      try {
        const participanteNovo = {};
        const participanteExistente = null;

        const credenciamentoApproveServices: any = {
          updateParticipantForApproval: async () => {
            expect('not').toBe('here');
          },
          createParticipantForApproval: async (model: any) => {
            expect(model).toBe(participanteNovo);
            return {};
          }
        };

        const saveParticipantForApproval = saveParticipantForApprovalService(
          credenciamentoApproveServices
        );

        const result = await saveParticipantForApproval(
          participanteNovo,
          participanteExistente,
          null
        );

        expect(result).toBeTruthy();

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

});
