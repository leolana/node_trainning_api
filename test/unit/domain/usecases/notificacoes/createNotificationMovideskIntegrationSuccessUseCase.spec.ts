// tslint:disable:no-magic-numbers
import createNotificationMovideskIntegrationSuccessUseCase from '../../../../../src/domain/usecases/notificacoes/createNotificationMovideskIntegrationSuccessUseCase';
import notificacaoCategoriaEnum from '../../../../../src/domain/services/notificacoes/notificacaoCategoriaEnum';
import rolesEnum from '../../../../../src/domain/services/auth/rolesEnum';
import usuarioNotificacaoEnum from '../../../../../src/domain/services/notificacoes/usuarioNotificacaoEnum';
import * as Errors from '../../../../../src/interfaces/rest/errors/ApiErrors';

describe('Domain :: UseCases :: Notificacoes :: createNotificationMovideskIntegrationSuccessUseCase', () => {

  test(
    `
      Should create a Movidesk notification of success
    `,
    async (done) => {
      try {
        const userEmail = 'alpe@alpe.com.br';
        const participanteId = 18;

        const notificationUseCases = {
          addNotification: async (model: any, roles: any[], email: string, id: number) => {
            expect(model.categoriaId).toBe(notificacaoCategoriaEnum.movidesk);
            expect(model).toHaveProperty('dataExpiracao');
            expect(model.usuarioNotificacao.status).toBe(usuarioNotificacaoEnum.naoLido);
            expect(roles.length).toBe(1);
            expect(roles[0]).toBe(rolesEnum.boAdministrador);
            expect(email).toBe(userEmail);
            expect(id).toBe(participanteId);
          }
        };

        const createNotificationMovideskIntegrationSuccess = createNotificationMovideskIntegrationSuccessUseCase(
          notificationUseCases,
          null
        );

        await createNotificationMovideskIntegrationSuccess(
          userEmail,
          participanteId
        );

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

  test(
    `
      Should NOT bubble errors because this flow is not mandatory
    `,
    async (done) => {
      try {
        const userEmail = 'alpe@alpe.com.br';
        const participanteId = 18;

        const notificationUseCases = {
          addNotification: async () => {
            throw new Errors.PreconditionFailedError('...');
          }
        };

        const logger: any = {
          info: (message: string) => {
            expect(message).toBeTruthy();
          },
          error: (error: any) => {
            expect(error.message).toBe('...');
          }
        };

        const createNotificationMovideskIntegrationSuccess = createNotificationMovideskIntegrationSuccessUseCase(
          notificationUseCases,
          logger
        );

        await createNotificationMovideskIntegrationSuccess(
          userEmail,
          participanteId
        );

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

});
