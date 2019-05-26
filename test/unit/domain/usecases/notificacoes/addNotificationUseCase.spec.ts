import database from '../../../../support/database';
import { DateTime } from 'luxon';
import addNotificationUseCase from '../../../../../src/domain/usecases/notificacoes/addNotificationUseCase';
import rolesEnum from '../../../../../src/domain/services/auth/rolesEnum';

describe('Domain :: UseCases :: Notificacao :: Add', () => {
  const addNotification = addNotificationUseCase(database);
  const email = 'email@email.com';

  test('Expect to throw ParticipanteNotFoundException without participanteId', async (done) => {
    try {
      const data = {};
      const role = [rolesEnum.boAdministrador];
      await addNotification(data, role, email);
      expect('not').toBe('here');
    } catch (error) {
      expect(error.message).toBe('participante-nao-encontrado');
    }
    done();
  });

  test('Expect to throw ParticipanteNotFoundException', async (done) => {
    try {
      database.entities.participante.findOne = async () => null;
      const data = { mensagem: 'Ocorreu um erro' };
      const role = [rolesEnum.boAdministrador];
      const participanteId = 1;
      await addNotification(data, role, email, participanteId);
      expect('not').toBe('here');
    } catch (error) {
      expect(error.message).toBe('participante-nao-encontrado');
    }
    done();
  });

  test('Expect to throw UserNotFoundException', async (done) => {
    try {
      database.entities.usuario.findAll = async () => ([]);
      const data = { mensagem: 'Ocorreu um erro' };
      const role = [rolesEnum.boAdministrador];
      await addNotification(data, role, email);
      expect('not').toBe('here');
    } catch (error) {
      expect(error.message).toBe('usuario-not-found');
    }
    done();
  });

  test('Expect to throw UserNotFoundException without email', async (done) => {
    try {
      const data = { mensagem: 'Ocorreu um erro' };
      const emptyMail = '';
      const participanteId = 1;
      const role = [rolesEnum.boAdministrador];
      await addNotification(data, role, emptyMail, participanteId);
      expect('not').toBe('here');
    } catch (error) {
      expect(error.message).toBe('usuario-not-found');
    }
    done();
  });

  test('Expect to throw NotificationCategoryNotFoundException', async (done) => {
    try {
      database.entities.usuario.findAll = async () => ([{ email, id: '00000000-0000-0000-0000-000000000000' }]);
      database.entities.notificacaoCategoria.findOne = async () => null;
      const data = {
        usuarioNotificacao: {},
        mensagem: 'Ocorreu um erro'
      };
      const role = [rolesEnum.boAdministrador];
      await addNotification(data, role, email);
      expect('not').toBe('here');
    } catch (error) {
      expect(error.message).toBe('notification-category-not-found');
    }
    done();
  });

  test('Add notification with defined message', async (done) => {
    try {
      database.entities.usuario.findAll = async () => ([{ email, id: '00000000-0000-0000-0000-000000000000' }]);
      database.entities.notificacaoCategoria.findOne = async () => ({});
      database.entities.notificacao.create = async () => true;

      const newNotificacao = {
        categoriaId: 1,
        criadorId: '00000000-0000-0000-0000-000000000000',
        mensagem: 'Alguém integrou-se 2',
        dataExpiracao: DateTime.local().plus({ days: 5 }),
        usuarioNotificacao: {
          usuarioId: '00000000-0000-0000-0000-000000000000',
          status: 2,
        }
      };
      const role = [rolesEnum.boAdministrador];
      await addNotification(newNotificacao, role, email);
      done();
    } catch (err) {
      expect('not').toBe('here');
    }
  });

  test('Add notification with participanteId', async (done) => {
    try {
      database.entities.participante.findOne = async () => ({ nome: 'Nome' });
      database.entities.participanteFornecedor.findOne = async () => ({});
      database.entities.usuario.findAll = async () => ([{ email, id: '00000000-0000-0000-0000-000000000000' }]);
      database.entities.notificacaoCategoria.findOne = async () => ({});
      database.entities.notificacao.create = async () => true;

      const newNotificacao = {
        categoriaId: 1,
        criadorId: '00000000-0000-0000-0000-000000000000',
        dataExpiracao: DateTime.local().plus({ days: 5 }),
        usuarioNotificacao: {
          usuarioId: '00000000-0000-0000-0000-000000000000',
          status: 2,
        }
      };
      const participanteId = 1;
      const role = [rolesEnum.boAdministrador];
      await addNotification(newNotificacao, role, email, participanteId);
      done();
    } catch (err) {
      expect('not').toBe('here');
    }
  });
});
