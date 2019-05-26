// tslint:disable:no-magic-numbers
import database from '../../../../../support/database';
import inactivatePreviousAccreditationUseCase from '../../../../../../src/domain/usecases/credenciamento/edit/inactivatePreviousAccreditationUseCase';

describe('Domain :: UseCases :: Credenciamento :: Edit :: inactivatePreviousAccreditationUseCase', () => {

  test(
    `
      Should call both (credenciamentoAnterior.update) and (participanteAceiteTermo.update)
      with correct arguments
    `,
    async (done) => {
      try {

        const participanteExistenteId = 117;

        const credenciamentoAnterior = {
          update: async (changes: any, config: any) => {
            expect(config).toHaveProperty('transaction');

            expect(Object.keys(changes).length).toBe(1);
            expect(changes.ativo).toBe(false);
          }
        };

        const userEmail = 'alpe@alpe.com.br';
        const transaction = null;

        database.entities.participanteAceiteTermo.update = async (changes: any, config: any) => {
          expect(config).toHaveProperty('transaction');
          expect(config.where.participanteId).toBe(participanteExistenteId);

          expect(Object.keys(changes).length).toBe(1);
          expect(changes.usuario).toBe(userEmail);
        };

        const inactivatePreviousAccreditation = await inactivatePreviousAccreditationUseCase(
          database
        );

        await inactivatePreviousAccreditation(
          participanteExistenteId,
          credenciamentoAnterior,
          userEmail,
          transaction
        );

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

});
