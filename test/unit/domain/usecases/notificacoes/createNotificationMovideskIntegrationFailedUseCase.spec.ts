// tslint:disable:no-magic-numbers
import database from '../../../../support/database';
import createNotificationMovideskIntegrationFailedUseCase from '../../../../../src/domain/usecases/notificacoes/createNotificationMovideskIntegrationFailedUseCase';
import notificacaoCategoriaEnum from '../../../../../src/domain/services/notificacoes/notificacaoCategoriaEnum';
import rolesEnum from '../../../../../src/domain/services/auth/rolesEnum';
import usuarioNotificacaoEnum from '../../../../../src/domain/services/notificacoes/usuarioNotificacaoEnum';

describe('Domain :: UseCases :: Notificacoes :: createNotificationMovideskIntegrationFailedUseCase', () => {

  test(
    `
      Should log custom exception if no participant data is sent, in this flow
      an error should never bubble up, because it is not mandatory to work
    `,
    async (done) => {
      try {
        const logger: any = {
          warn: (message: string) => {
            expect(message).toBeTruthy();
          },
          error: (error: any) => {
            expect(error.message).toBe('missing-participante');
          }
        };

        const createNotificationMovideskIntegrationFailed = createNotificationMovideskIntegrationFailedUseCase(
          null,
          null,
          logger
        );

        await createNotificationMovideskIntegrationFailed(
          null,
          null
        );

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

  test(
    `
      Should create a Movidesk notification of integration failed
    `,
    async (done) => {
      try {
        const userEmail = 'alpe@alpe.com.br';
        const participante = {
          id: 97
        };

        database.entities.participanteFornecedor.findOne = async (config: any) => {
          expect(config.where.participanteId).toBe(participante.id);
        };

        const notificationUseCases = {
          addNotification: async (model: any, roles: any[], email: string) => {
            expect(model.categoriaId).toBe(notificacaoCategoriaEnum.movidesk);
            expect(model.mensagem).toBeTruthy();
            expect(model.dataExpiracao).toBeTruthy();
            expect(model.usuarioNotificacao.status).toBe(usuarioNotificacaoEnum.naoLido);

            expect(roles.length).toBe(1);
            expect(roles[0]).toBe(rolesEnum.boAdministrador);
            expect(email).toBe(userEmail);
          }
        };

        const createNotificationMovideskIntegrationFailed = createNotificationMovideskIntegrationFailedUseCase(
          database,
          notificationUseCases,
          null
        );

        await createNotificationMovideskIntegrationFailed(
          participante,
          userEmail
        );

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

});
