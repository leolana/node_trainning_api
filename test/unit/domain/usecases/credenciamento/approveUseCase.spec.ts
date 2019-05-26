import database from '../../../../support/database';
import approveUseCase from '../../../../../src/domain/usecases/credenciamento/approveUseCase';

describe('Domain :: UseCases :: Credenciamento :: Approve', () => {
  const auth: any = {
    inviteUser() {
      return Promise.resolve();
    }
  };

  const credenciamentoServices: any = {
    findService() {
      const credenciamento = {};
      return Promise.resolve(credenciamento);
    },
    approveService() {
      const newParticipant = { contatos: [{}] };
      return Promise.resolve(newParticipant);
    }
  };

  const approve = approveUseCase(database, auth, credenciamentoServices);

  test('Approve credenciamento', async (done) => {
    const idCredenciamento = 1;
    const credenciamento = await approve(idCredenciamento, 'user');

    expect(credenciamento).toBeTruthy();
    done();
  });

});
