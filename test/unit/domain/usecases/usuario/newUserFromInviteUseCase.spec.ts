import newUserFromInviteUseCase from '../../../../../src/domain/usecases/usuario/newUserFromInviteUseCase';
import database from '../../../../support/database';
import dataFaker from '../../../../support/dataFaker';

describe('Domain :: UseCases :: Usuario :: NewUserFromInvite', () => {

  const prepareDB = () => {
    database.entities.usuario.findOne = (): any => {
      return null;
    };

    database.entities.usuarioConvite.findOne = (): any => {
      return Promise.resolve({
        username: 'teste@itlab.com.br',
        email: 'teste@itlab.com.br',
        nome: 'Teste Itlab',
        roles: [],
        celular: '11987006501',
        destroy: () => Promise.resolve()
      });
    };

    database.entities.usuario.create = (obj): any => {
      return Promise.resolve(obj);
    };

    database.entities.membro.create = (obj): any => {
      return Promise.resolve(obj);
    };
  };

  const auth: any = {
    createUser() {
      const userId = dataFaker.guid();
      return Promise.resolve(userId);
    }
  };

  const newUserFromInvite = newUserFromInviteUseCase(database, auth);

  test('happy path', async (done) => {
    const codigo = dataFaker.guid();
    const email = 'teste@itlab.com.br';
    const passwd = '12345678';
    const roles = [];

    try {
      prepareDB();
      const result = await newUserFromInvite(codigo, email, passwd, roles);
      expect(result).toBe(true);
    } catch (e) {
      expect(e).toBe(null);
    }

    done();
  });

});
