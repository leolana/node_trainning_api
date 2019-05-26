// tslint:disable:no-magic-numbers
import approveService from '../../../../../src/domain/services/credenciamento/approveService';

describe('Domain :: Services :: Credenciamento :: approveService', () => {

  test(
    `
      Should call each service in the correct order starting in 1
      Should return the created (participanteNovo)
    `,
    async (done) => {
      try {
        const participanteNovo = {};
        let step = 0;

        const credenciamentoServices: any = {
          inactivateDuplicatesService: async () => {
            expect(step += 1).toBe(8);
          }
        };

        const credenciamentoApproveServices: any = {
          validateCredenciamentoBeforeApproval: async () => {
            expect(step += 1).toBe(1);
          },
          getParticipantFromAccreditationDataForApproval: async () => {
            expect(step += 1).toBe(2);
            return participanteNovo;
          },
          getParticipantIdForApproval: async () => {
            expect(step += 1).toBe(3);
          },
          saveParticipantForApproval: async (model: any) => {
            expect(step += 1).toBe(4);
            return model;
          },
          createAccreditationApproval: async () => {
            expect(step += 1).toBe(5);
          },
          approveSaveAccreditation: async () => {
            expect(step += 1).toBe(6);
          },
          approveCreateEstablishment: async () => {
            expect(step += 1).toBe(7);
          },
          approveSyncSiscof: async () => {
            expect(step += 1).toBe(9);
          }
        };

        const approve = approveService(
          credenciamentoServices,
          credenciamentoApproveServices
        );

        const credenciamento = {};
        const participanteExistente = null;
        const userEmail = 'alpe@alpe.com.br';
        const transaction = null;

        const result = await approve(
          credenciamento,
          participanteExistente,
          userEmail,
          transaction
        );

        expect(result).toBe(participanteNovo);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

});
