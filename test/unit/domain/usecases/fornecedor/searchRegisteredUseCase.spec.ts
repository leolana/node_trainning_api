import database from '../../../../support/database';
import searchRegisteredUseCase from '../../../../../src/domain/usecases/fornecedor/searchRegisteredUseCase';

describe('Domain :: UseCases :: Fornecedor :: SearchRegistered', () => {
  const search = searchRegisteredUseCase(database);

  test('Search Suplier Registered', async (done) => {
    const options = {
      dataInicioSolicitacao: null,
      dataFimSolicitacao: null,
      documento: '000000000000000',
    };
    const fornecedor = await search(options);

    expect(fornecedor).toBeTruthy();
    done();
  });

});
