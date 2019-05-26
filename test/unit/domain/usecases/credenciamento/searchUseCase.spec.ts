import database from '../../../../support/database';
import search from '../../../../../src/domain/usecases/credenciamento/search';

describe('Domain :: UseCases :: Credenciamento :: Search', () => {
  const searchUseCase = search(database);

  test('Search Accreditation', async (done) => {
    const options = {
      de: null,
      ate: null,
      nome: null,
      preCadastro: null,
      status: null,
      codigoEc: null,
      documento: null,
    };
    const credenciamento = await searchUseCase(options);

    expect(credenciamento).toBeTruthy();
    done();
  });

});
