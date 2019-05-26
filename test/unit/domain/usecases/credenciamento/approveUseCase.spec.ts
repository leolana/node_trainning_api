// tslint:disable:no-magic-numbers
import database from '../../../../support/database';
import approveUseCase from '../../../../../src/domain/usecases/credenciamento/approveUseCase';
import { PreconditionFailedError } from '../../../../../src/interfaces/rest/errors/ApiErrors';

describe('Domain :: UseCases :: Credenciamento :: approveUseCase', () => {

  test(
    `
      Should call each usecase in the correct order starting in 1
      Should return the created (credenciamento)
      Any error on (credenciamentoApproveUsecases.sendParticipantInvitation) should NOT be thrown
    `,
    async (done) => {
      try {

        const credenciamentoId = 7;
        const credenciamento = {};
        const userEmail = 'alpe@alpe.com.br';

        database.transaction = async () => ({
          rollback: async () => {
            expect('not').toBe('rollback');
          },
          commit: async () => null
        });

        let step = 0;

        const credenciamentoApproveUseCases: any = {
          acceptTermOnApprove: async () => {
            expect(step += 1).toBe(3);
          },
          checkIndicationsToEstablishment: async () => {
            expect(step += 1).toBe(4);
          },
          sendParticipantInvitation: async () => {
            expect('not').toBe('here');
          }
        };

        const credenciamentoServices: any = {
          findService: async () => {
            expect(step += 1).toBe(1);
            return credenciamento;
          },
          approveService: async () => {
            expect(step += 1).toBe(2);
            return {};
          }
        };

        const approve = approveUseCase(
          database,
          credenciamentoApproveUseCases,
          credenciamentoServices
        );

        const result = await approve(
          credenciamentoId,
          userEmail
        );

        expect(result).toBe(credenciamento);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

  test(
    `
      Should call each usecase in the correct order starting in 1
      Should throw errors when not a (credenciamentoApproveUsecases.sendParticipantInvitation) error
    `,
    async (done) => {
      try {

        const credenciamentoId = 7;
        const credenciamento = {};
        const userEmail = 'alpe@alpe.com.br';

        database.transaction = async () => ({
          rollback: async () => null,
          commit: async () => {
            expect('not').toBe('commit');
          }
        });

        let step = 0;

        const credenciamentoApproveUseCases: any = {
          acceptTermOnApprove: async () => {
            expect(step += 1).toBe(3);
          },
          checkIndicationsToEstablishment: async () => {
            throw new PreconditionFailedError('...');
          }
        };

        const credenciamentoServices: any = {
          findService: async () => {
            expect(step += 1).toBe(1);
            return credenciamento;
          },
          approveService: async () => {
            expect(step += 1).toBe(2);
            return {};
          }
        };

        const approve = approveUseCase(
          database,
          credenciamentoApproveUseCases,
          credenciamentoServices
        );

        await approve(
          credenciamentoId,
          userEmail
        );

        expect('not').toBe('here');

      } catch (error) {
        expect(error.message).toBe('...');
      }

      done();
    }
  );

});
