import inviteUserUseCase from '../../../../../src/domain/usecases/usuario/inviteUserUseCase';
import database from '../../../../support/database';

describe('Domain :: UseCases :: Usuario :: InviteUser', () => {
  const prepareDB = () => {
    database.entities.usuario.findOne = (): any => {
      return Promise.resolve(null);
    };

    database.entities.usuarioConvite.findOne = (): any => {
      return Promise.resolve(null);
    };

    database.transaction = (): any => {
      return Promise.resolve({
        commit: () => Promise.resolve(),
        rollback: () => Promise.resolve()
      });
    };
  };

  const auth: any = {
    inviteUser() {
      return Promise.resolve();
    }
  };

  const accountUseCases: any = {
    deleteInvite() {
      return Promise.resolve();
    }
  };

  const inviteUser = inviteUserUseCase(database, auth, accountUseCases);

  test('happy path', async (done) => {
    const nome = 'nome';
    const email = 'teste@itlab.com.br';
    const celular = '11967854319';
    const roles = [];
    const participanteId = 1;
    const convidadoPor = 'master@itlab.com.br';

    try {
      prepareDB();
      const result = await inviteUser(nome, email, celular, roles, participanteId, convidadoPor);
      expect(result).toBe(true);
    } catch (e) {
      expect(e).toBe(null);
    }

    done();
  });

});
