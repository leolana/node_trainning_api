// tslint:disable:no-magic-numbers
import checkIfBankingDataChangedUseCase from '../../../../../../src/domain/usecases/credenciamento/edit/checkIfBankingDataChangedUseCase';

describe('Domain :: UseCases :: Credenciamento :: Edit :: checkIfBankingDataChangedUseCase', () => {

  test(
    `
      Should return (false) because (participanteAntigo) data is the same as (participanteNovo) data
    `,
    async (done) => {
      try {

        const participanteAntigo = {
          domiciliosBancarios: [
            {
              bandeiraId: 7,
              bancoNome: 'Itau',
              agencia: '0001',
              conta: '54321',
              digito: '0',
              arquivo: '...'
            }
          ]
        };
        const participanteNovo = {
          domiciliosBancarios: [
            {
              bandeiraId: 7,
              bancoNome: 'Itau',
              agencia: '0001',
              conta: '54321',
              digito: '0',
              arquivo: '...'
            }
          ]
        };

        const result = await checkIfBankingDataChangedUseCase(
          participanteAntigo,
          participanteNovo
        );

        expect(result).toBe(false);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

  test(
    `
      Should return (true) because (participanteAntigo.conta) changed in (participanteNovo) data
    `,
    async (done) => {
      try {

        const participanteAntigo = {
          domiciliosBancarios: [
            {
              bandeiraId: 7,
              bancoNome: 'Itau',
              agencia: '0001',
              conta: '54321',
              digito: '0',
              arquivo: '...'
            }
          ]
        };
        const participanteNovo = {
          domiciliosBancarios: [
            {
              bandeiraId: 7,
              bancoNome: 'Itau',
              agencia: '0001',
              conta: '12345',
              digito: '0',
              arquivo: '...'
            }
          ]
        };

        const result = await checkIfBankingDataChangedUseCase(
          participanteAntigo,
          participanteNovo
        );

        expect(result).toBe(true);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

});
