import validateCredenciamentoBeforeApprovalService from '../../../../../../src/domain/services/credenciamento/approve/validateCredenciamentoBeforeApprovalService';
import credenciamentoStatusEnum from '../../../../../../src/domain/entities/credenciamentoStatusEnum';

describe('Domain :: Services :: Credenciamento :: Approve :: validateCredenciamentoBeforeApprovalService', () => {

  test(
    `
      Should throw custom exception when no (credenciamento) objet model is not set
    `,
    async (done) => {
      try {
        const credenciamento = null;
        const participanteExistente = null;

        await validateCredenciamentoBeforeApprovalService(
          credenciamento,
          participanteExistente
        );

        expect('not').toBe('here');

      } catch (error) {
        expect(error.message).toBe('credenciamento-nao-localizado');
      }

      done();
    }
  );

  test(
    `
      Should throw custom exception when:
      - (credenciamento) objet model is set
      - (participanteExistente) is set
      - (credenciamento.status) is not 'aprovado'
    `,
    async (done) => {
      try {
        const credenciamento = { status: credenciamentoStatusEnum.emAnalise };
        const participanteExistente = {};

        await validateCredenciamentoBeforeApprovalService(
          credenciamento,
          participanteExistente
        );

        expect('not').toBe('here');

      } catch (error) {
        expect(error.message).toBe('credenciamento-status-invalido');
      }

      done();
    }
  );

  test(
    `
      Should pass all validations when:
      - (credenciamento) objet model is set
      - (participanteExistente) is set
      - (credenciamento.status) is 'aprovado'
      Should keep (credenciamento.status) as 'aprovado'
    `,
    async (done) => {
      try {
        const credenciamento = { status: credenciamentoStatusEnum.aprovado };
        const participanteExistente = {};

        await validateCredenciamentoBeforeApprovalService(
          credenciamento,
          participanteExistente
        );

        expect(credenciamento.status).toBe(credenciamentoStatusEnum.aprovado);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

  test(
    `
      Should throw custom exception when:
      - (credenciamento) objet model is set
      - (participanteExistente) is not set
      - (credenciamento.status) is not 'emAnalise'
    `,
    async (done) => {
      try {
        const credenciamento = { status: credenciamentoStatusEnum.aprovado };
        const participanteExistente = null;

        await validateCredenciamentoBeforeApprovalService(
          credenciamento,
          participanteExistente
        );

        expect('not').toBe('here');

      } catch (error) {
        expect(error.message).toBe('credenciamento-status-invalido');
      }

      done();
    }
  );

  test(
    `
    Should pass all validations when:
      - (credenciamento) objet model is set
      - (participanteExistente) is not set
      - (credenciamento.status) is 'emAnalise'
    Should set (credenciamento.status) as 'aprovado'
    `,
    async (done) => {
      try {
        const credenciamento = { status: credenciamentoStatusEnum.emAnalise };
        const participanteExistente = null;

        await validateCredenciamentoBeforeApprovalService(
          credenciamento,
          participanteExistente
        );

        expect(credenciamento.status).toBe(credenciamentoStatusEnum.aprovado);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

});
