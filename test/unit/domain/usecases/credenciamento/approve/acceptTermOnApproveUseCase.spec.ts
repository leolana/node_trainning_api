// tslint:disable:no-magic-numbers
import database from '../../../../../support/database';
import acceptTermOnApproveUseCase from '../../../../../../src/domain/usecases/credenciamento/approve/acceptTermOnApproveUseCase';

describe('Domain :: UseCases :: Credenciamento :: Approve :: acceptTermOnApproveUseCase', () => {

  test(
    `
      Should throw custom exception when (termo) is not found
    `,
    async (done) => {
      try {

        database.entities.termo.findOne = async (config: any) => {
          expect(config).toHaveProperty('transaction');

          expect(config.where).toHaveProperty('inicio');
          expect(config.where).toHaveProperty('fim');
          expect(config.where).toHaveProperty('tipo');

          return null;
        };

        const acceptTermOnApprove = acceptTermOnApproveUseCase(
          database
        );

        const participanteId = 1;
        const userEmail = 'alpe@alpe.com.br';
        const transaction = null;

        await acceptTermOnApprove(
          participanteId,
          userEmail,
          transaction
        );

        expect('not').toBe('here');

      } catch (error) {
        expect(error.message).toBe('termo-nao-encontrado');
      }

      done();
    }
  );

  test(
    `
      Should call (participanteAceiteTermo.create) with correct values
      when (termo) is found
    `,
    async (done) => {
      try {

        const termo = {
          id: 3
        };

        const participanteId = 17;
        const userEmail = 'alpe@alpe.com.br';
        const transaction = null;

        database.entities.termo.findOne = async (config: any) => {
          expect(config).toHaveProperty('transaction');

          expect(config.where).toHaveProperty('inicio');
          expect(config.where).toHaveProperty('fim');
          expect(config.where).toHaveProperty('tipo');

          return termo;
        };

        database.entities.participanteAceiteTermo.create = async (model: any, config: any) => {
          expect(config).toHaveProperty('transaction');

          expect(model.participanteId).toBe(participanteId);
          expect(model.termoId).toBe(termo.id);
          expect(model.usuario).toBe(userEmail);

          return {};
        };

        const acceptTermOnApprove = acceptTermOnApproveUseCase(
          database
        );

        await acceptTermOnApprove(
          participanteId,
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
