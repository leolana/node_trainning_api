// tslint:disable:no-magic-numbers
import database from '../../../../support/database';
import forceMovideskPersonIntegrationUseCase from '../../../../../src/domain/usecases/movidesk/forceMovideskPersonIntegrationUseCase';
import uuid = require('uuid');

describe('Domain :: UseCases :: Movidesk :: forceMovideskPersonIntegrationUseCase', () => {

  test(
    `
      Should throw custom exception if invalid participanteId is received
    `,
    async (done) => {
      try {
        const userEmail = 'alpe@alpe.com.br';

        const notificationUseCases = {
          createNotificationMovideskIntegrationFailed: async (model: any, email: string) => {
            expect(model).toBe(null);
            expect(email).toBe(userEmail);
          }
        };

        const forceMovideskPersonIntegration = forceMovideskPersonIntegrationUseCase(
          null,
          null,
          notificationUseCases,
          null
        );

        await forceMovideskPersonIntegration(
          null,
          userEmail
        );

        expect('not').toBe('here');

      } catch (error) {
        expect(error.message).toBe('invalid-participante-id');
      }

      done();
    }
  );

  test(
    `
      Should throw custom exception if participante is not found
    `,
    async (done) => {
      try {
        const participanteId = 21;
        const userEmail = 'alpe@alpe.com.br';

        const notificationUseCases = {
          createNotificationMovideskIntegrationFailed: async (model: any, email: string) => {
            expect(model).toBe(null);
            expect(email).toBe(userEmail);
          }
        };

        database.entities.participante.findOne = async (config: any) => {
          expect(config.where.id).toBe(participanteId);
          expect(config.include.length).toBe(2);
          expect(config.include[0].as).toBe('cidade');
          expect(config.include[1].as).toBe('contatos');

          return null;
        };

        const forceMovideskPersonIntegration = forceMovideskPersonIntegrationUseCase(
          database,
          null,
          notificationUseCases,
          null
        );

        await forceMovideskPersonIntegration(
          participanteId,
          userEmail
        );

        expect('not').toBe('here');

      } catch (error) {
        expect(error.message).toBe('participante-nao-encontrado');
      }

      done();
    }
  );

  test(
    `
      Should call movideskUseCases.sendParticipantToMovidesk when there is no
      person at Movidesk matching the participante
    `,
    async (done) => {
      try {
        const participanteId = 21;
        const userEmail = 'alpe@alpe.com.br';

        const participante = {
          id: participanteId,
          documento: '50553766000171'
        };

        const notificationUseCases = {
          createNotificationMovideskIntegrationFailed: async () => {
            expect('not').toBe('here');
          },
          createNotificationMovideskIntegrationSuccess: async (email: string, id: number) => {
            expect(email).toBe(userEmail);
            expect(id).toBe(participante.id);
          }
        };

        database.entities.participante.findOne = async (config: any) => {
          expect(config.where.id).toBe(participanteId);
          expect(config.include.length).toBe(2);
          expect(config.include[0].as).toBe('cidade');
          expect(config.include[1].as).toBe('contatos');
          return participante;
        };

        const created = {
          id: uuid.v4()
        };

        const movideskUseCases: any = {
          checkMovideskPersonIntegration: async (id: number, doc: string) => {
            expect(id).toBe(participante.id);
            expect(doc).toBe(participante.documento);
            return null;
          },
          sendParticipantToMovidesk: async (model: any, email: string) => {
            expect(model).toBe(participante);
            expect(email).toBe(userEmail);
            return created;
          },
          updateParticipantMovideskIntegrationExistent: async (id: number, code: string, email: string) => {
            expect(id).toBe(participanteId);
            expect(code).toBe(created.id);
            expect(email).toBe(userEmail);
          }
        };

        const forceMovideskPersonIntegration = forceMovideskPersonIntegrationUseCase(
          database,
          null,
          notificationUseCases,
          movideskUseCases
        );

        await forceMovideskPersonIntegration(
          participanteId,
          userEmail
        );

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

  test(
    `
      Should NOT call movideskUseCases.sendParticipantToMovidesk when there
      already exists a person at Movidesk matching the participante data
    `,
    async (done) => {
      try {
        const participanteId = 21;
        const userEmail = 'alpe@alpe.com.br';

        const participante = {
          id: participanteId,
          documento: '50553766000171'
        };

        const notificationUseCases = {
          createNotificationMovideskIntegrationFailed: async () => {
            expect('not').toBe('here');
          },
          createNotificationMovideskIntegrationSuccess: async (email: string, id: number) => {
            expect(email).toBe(userEmail);
            expect(id).toBe(participante.id);
          }
        };

        database.entities.participante.findOne = async (config: any) => {
          expect(config.where.id).toBe(participanteId);
          expect(config.include.length).toBe(2);
          expect(config.include[0].as).toBe('cidade');
          expect(config.include[1].as).toBe('contatos');
          return participante;
        };

        const existing = {
          id: uuid.v4()
        };

        const movideskUseCases: any = {
          checkMovideskPersonIntegration: async (id: number, doc: string) => {
            expect(id).toBe(participante.id);
            expect(doc).toBe(participante.documento);
            return existing;
          },
          sendParticipantToMovidesk: async () => {
            expect('not').toBe('here');
          },
          updateParticipantMovideskIntegrationExistent: async (id: number, code: string, email: string) => {
            expect(id).toBe(participanteId);
            expect(code).toBe(existing.id);
            expect(email).toBe(userEmail);
          }
        };

        const forceMovideskPersonIntegration = forceMovideskPersonIntegrationUseCase(
          database,
          null,
          notificationUseCases,
          movideskUseCases
        );

        await forceMovideskPersonIntegration(
          participanteId,
          userEmail
        );

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

});
