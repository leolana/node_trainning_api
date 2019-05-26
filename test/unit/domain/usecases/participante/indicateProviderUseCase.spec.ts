import indicateProviderUseCase from '../../../../../src/domain/usecases/participante/indicateProviderUseCase';
import database from '../../../../support/database';

describe('Domain :: UseCases :: Participante :: indicateProvider', () => {
  const mailer: any = { enviar: () => null };
  const mailerSettings: any = { baseUrl: '' };
  const logger: any = { error: () => null };

  const nome = 'indicacao';
  const email = 'mail@mail';
  const telefone = '32373953';
  const documento = '32556989780';
  const participanteFornecedor = true;
  const estabelecimentoComercialId = 1;

  database.entities.participante.findAll = async () => ([{
    id: 1,
    indicacoes: [{
      documento: '33333333333'
    }]
  }]);

  test('Successfully indicateProvider', async (done) => {
    try {
      const indicateProvider = indicateProviderUseCase(database, mailer, mailerSettings, logger);

      await indicateProvider(
        nome,
        email,
        telefone,
        documento,
        participanteFornecedor,
        estabelecimentoComercialId
      );
      done();
    } catch (error) {
      expect(error).toBe(null);
    }
  });

  test('try to indicateProvider and throws AlreadyNominatedProviderException', async (done) => {
    try {
      const differentDoc = '33333333333';
      const indicateProvider = indicateProviderUseCase(database, mailer, mailerSettings, logger);

      await indicateProvider(
        nome,
        email,
        telefone,
        differentDoc,
        participanteFornecedor,
        estabelecimentoComercialId
      );

      expect('not').toBe('here');
    } catch (error) {
      expect(error).toBeTruthy();
      expect(error.message).toBe('fornecedor-ja-indicado');
    }
    done();
  });

  test('try to indicateProvider and throws EstablishmentNotFoundException', async (done) => {
    try {
      const differentEstabelecimentoComercialId = 8;
      const indicateProvider = indicateProviderUseCase(database, mailer, mailerSettings, logger);

      await indicateProvider(
        nome,
        email,
        telefone,
        documento,
        participanteFornecedor,
        differentEstabelecimentoComercialId
      );

      expect('not').toBe('here');
    } catch (error) {
      expect(error).toBeTruthy();
      expect(error.message).toBe('estabelecimento-nao-encontrado');
    }
    done();
  });
});
