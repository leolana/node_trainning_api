import validateAccreditationService from '../../../../../../src/domain/services/credenciamento/mutate/validateAccreditationService';
import personTypeEnum from '../../../../../../src/domain/services/participante/personTypeEnum';

describe('Domain :: Services :: Credenciamento :: Mutate :: validateAccreditationService', () => {

  test(
    `
      Should throw custom exception when
        - there is invalid value for (credenciamento.tipoPessoa)
    `,
    async (done) => {
      try {

        const credenciamento = {};

        await validateAccreditationService(
          credenciamento
        );

        expect('not').toBe('here');

      } catch (error) {
        expect(error.message).toBe('tipoPessoa-invalido');
      }

      done();
    }
  );

  test(
    `
      Should throw custom exception when
        - there is valid value for (credenciamento.tipoPessoa),
        - there is invalid value for (dataNascimentoAbertura)
    `,
    async (done) => {
      try {

        const credenciamento = {
          tipoPessoa: personTypeEnum.fisica,
          dadosCadastrais: {
            aberturaNascimento: `${new Date().getFullYear() + 1}-12-20`
          }
        };

        await validateAccreditationService(
          credenciamento
        );

        expect('not').toBe('here');

      } catch (error) {
        expect(error.message).toBe('invalid-sent-data');
      }

      done();
    }
  );

  test(
    `
      Should throw custom exception when
        - there is valid value for (credenciamento.tipoPessoa),
        - there is valid value for (dataNascimentoAbertura),
        - there is invalid value for some (socio.aberturaNascimento)
    `,
    async (done) => {
      try {

        const credenciamento = {
          tipoPessoa: personTypeEnum.fisica,
          dadosCadastrais: {
            aberturaNascimento: '2010-12-20',
            socios: [
              { aberturaNascimento: '2010-12-20' },
              { aberturaNascimento: '2010-12-20' },
              { aberturaNascimento: '2010-12-20' },
              { aberturaNascimento: '2010-12-20' },
              { aberturaNascimento: '2010-12-20' },
              { aberturaNascimento: `${new Date().getFullYear() + 1}-12-20` }
            ]
          }
        };

        await validateAccreditationService(
          credenciamento
        );

        expect('not').toBe('here');

      } catch (error) {
        expect(error.message).toBe('dataAberturaNascimento-socios-invalida');
      }

      done();
    }
  );

  test(
    `
      Should NOT throw exception when
        - there is valid value for (credenciamento.tipoPessoa),
        - there is valid value for (dataNascimentoAbertura),
        - there is valid value for every (socio.aberturaNascimento)
    `,
    async (done) => {
      try {

        const credenciamento = {
          tipoPessoa: personTypeEnum.fisica,
          dadosCadastrais: {
            aberturaNascimento: '2010-12-20',
            socios: [
              { aberturaNascimento: '2010-12-20' },
              { aberturaNascimento: '2010-12-20' },
              { aberturaNascimento: '2010-12-20' },
              { aberturaNascimento: '2010-12-20' },
              { aberturaNascimento: '2010-12-20' },
              { aberturaNascimento: '2010-12-20' }
            ]
          }
        };

        await validateAccreditationService(
          credenciamento
        );

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

});
