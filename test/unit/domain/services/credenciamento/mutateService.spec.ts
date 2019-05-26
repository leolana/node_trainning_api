// tslint:disable:no-magic-numbers
import mutateService from '../../../../../src/domain/services/credenciamento/mutateService';
import credenciamentoStatusEnum from '../../../../../src/domain/entities/credenciamentoStatusEnum';

describe('Domain :: Services :: Credenciamento :: mutateService', () => {

  test(
    `
      Should call each service in the correct order starting in 1
      Should return the created (credenciamento)
    `,
    async (done) => {
      try {
        const credenciamento = {};
        let step = 0;

        const credenciamentoMutateServices: any = {
          validateAccreditation: async () => {
            expect(step += 1).toBe(1);
          },
          mapAccreditationFromWizardSteps: async () => {
            expect(step += 1).toBe(2);
            return credenciamento;
          },
          uploadAccreditationFiles: async () => {
            expect(step += 1).toBe(3);
            return [];
          },
          mapAccreditationFiles: async () => {
            expect(step += 1).toBe(4);
          },
          createAccreditation: async (model: any) => {
            expect(step += 1).toBe(5);
            return model;
          },
        };

        const mutate = mutateService(
          credenciamentoMutateServices
        );

        const credenciamentoEdicao = {};
        const statusCredenciamento = credenciamentoStatusEnum.emAnalise;
        const files = [];
        const documento = '36.058.689/0001-52';
        const userEmail = 'alpe@alpe.com.br';
        const unchangedFiles = {};
        const transaction = null;

        const created = await mutate(
          credenciamentoEdicao,
          statusCredenciamento,
          files,
          documento,
          userEmail,
          unchangedFiles,
          transaction
        );

        expect(credenciamento).toBe(created);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

});
