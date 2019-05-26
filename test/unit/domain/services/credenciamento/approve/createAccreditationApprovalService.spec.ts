import database from '../../../../../support/database';
import createAccreditationApprovalService from '../../../../../../src/domain/services/credenciamento/approve/createAccreditationApprovalService';
import credenciamentoStatusEnum from '../../../../../../src/domain/entities/credenciamentoStatusEnum';

describe('Domain :: Services :: Credenciamento :: Approve :: createAccreditationApprovalService', () => {

  const createAccreditationApproval = createAccreditationApprovalService(
    database
  );

  test(
    `
      Should create the (credenciamentoAprovacao) with valid properties and
      should set (observacao) as 'aprovado' when there is no (participanteExistente)
    `,
    async (done) => {
      try {
        const accreditationId = 1;
        const userEmail = 'alpe@alpe.com.br';
        const participanteExistente = null;

        database.entities.credenciamentoAprovacao.create = async (model: any, config: any) => {
          expect(model).toBeTruthy();
          expect(model.status).toBe(credenciamentoStatusEnum.aprovado);
          expect(model.credenciamentoId).toBe(accreditationId);
          expect(model.usuario).toBe(userEmail);
          expect(model.observacao).toBe('aprovado');

          expect(config).toHaveProperty('transaction');
          return model;
        };

        await createAccreditationApproval(
          accreditationId,
          participanteExistente,
          null,
          userEmail
        );
      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

  test(
    `
      Should create the (credenciamentoAprovacao) with valid properties and
      should set (observacao) as 'editado' when there is already a (participanteExistente)
    `,
    async (done) => {
      try {
        const accreditationId = 1;
        const userEmail = 'alpe@alpe.com.br';
        const participanteExistente = {};

        database.entities.credenciamentoAprovacao.create = async (model: any, config: any) => {
          expect(model).toBeTruthy();
          expect(model.status).toBe(credenciamentoStatusEnum.aprovado);
          expect(model.credenciamentoId).toBe(accreditationId);
          expect(model.usuario).toBe(userEmail);
          expect(model.observacao).toBe('editado');

          expect(config).toHaveProperty('transaction');
          return model;
        };

        await createAccreditationApproval(
          accreditationId,
          participanteExistente,
          null,
          userEmail
        );
      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

});
