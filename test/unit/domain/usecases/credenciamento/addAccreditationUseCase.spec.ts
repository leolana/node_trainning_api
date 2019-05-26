import database from '../../../../support/database';
import addAccreditationUseCase from '../../../../../src/domain/usecases/credenciamento/addAccreditationUseCase';
import { PreconditionFailedError } from '../../../../../src/interfaces/rest/errors/ApiErrors';

describe('Domain :: UseCases :: Credenciamento :: addAccreditationUseCase', () => {

  test(
    `
      Should commit the transaction when everything works
      Should also return the newly created (credenciamento)
    `,
    async (done) => {
      try {

        const credenciamento = {};

        database.transaction = async () => ({
          rollback: async () => {
            expect('not').toBe('rollback');
          },
          commit: async () => null
        });

        const credenciamentoServices: any = {
          mutateService: async () => {
            return credenciamento;
          }
        };

        const dadosCredenciamento = {};
        const files = [];
        const documento = '90.228.336/0001-07';
        const userEmail = 'alpe@alpe.com.br';

        const created = await addAccreditationUseCase(
          database,
          credenciamentoServices
        )(
          dadosCredenciamento,
          files,
          documento,
          userEmail
        );

        expect(created).toBe(credenciamento);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

  test(
    `
      Should rollback the transaction when some error is thrown
    `,
    async (done) => {
      try {

        database.transaction = async () => ({
          rollback: async () => null,
          commit: async () => {
            expect('not').toBe('commit');
          }
        });

        const credenciamentoServices: any = {
          mutateService: async () => {
            throw new PreconditionFailedError('...');
          }
        };

        const dadosCredenciamento = {};
        const files = [];
        const documento = '90.228.336/0001-07';
        const userEmail = 'alpe@alpe.com.br';

        await addAccreditationUseCase(
          database,
          credenciamentoServices
        )(
          dadosCredenciamento,
          files,
          documento,
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
