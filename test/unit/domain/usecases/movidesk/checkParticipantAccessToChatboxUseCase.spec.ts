// tslint:disable:no-magic-numbers
import database from '../../../../support/database';
import checkParticipantAccessToChatboxUseCase from '../../../../../src/domain/usecases/movidesk/checkParticipantAccessToChatboxUseCase';
import * as Errors from '../../../../../src/interfaces/rest/errors/ApiErrors';
import uuid = require('uuid');
import ParticipanteIntegracaoStatus from '../../../../../src/domain/entities/ParticipanteIntegracaoStatus';
import ParticipanteIntegracaoTipo from '../../../../../src/domain/entities/ParticipanteIntegracaoTipo';

describe('Domain :: UseCases :: Movidesk :: checkParticipantAccessToChatboxUseCase', () => {

  test(
    `
      Should return integrado (false) because the request
      is not from a participante user
    `,
    async (done) => {
      try {
        const checkParticipantAccessToChatbox = checkParticipantAccessToChatboxUseCase(
          null,
          null,
          null
        );

        const isParticipante = false;

        const result = await checkParticipantAccessToChatbox(
          null,
          isParticipante,
          null,
          null
        );

        expect(result.integrado).toBe(false);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

  test(
    `
      Should NOT throw error for participanteId 0 because it can be a
      backoffice user and the result should be integrado (false)
    `,
    async (done) => {
      try {
        const participanteId = 0;

        database.entities.participante.findOne = async (config: any) => {
          expect(config.where.id).toBe(participanteId);
          return null;
        };

        const logger: any = {
          error: () => null
        };

        const checkParticipantAccessToChatbox = checkParticipantAccessToChatboxUseCase(
          database,
          null,
          logger
        );

        const isParticipante = true;

        const result = await checkParticipantAccessToChatbox(
          participanteId,
          isParticipante,
          null,
          null
        );

        expect(result.integrado).toBe(false);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

  test(
    `
      Should NOT return errors from movidesk check, in those cases
      the result should be integrado (false)
    `,
    async (done) => {
      try {
        const participanteId = 3;
        const participante = {
          id: 3,
          documento: '50942099060'
        };

        database.entities.participante.findOne = async (config: any) => {
          expect(config.where.id).toBe(participanteId);
          return participante;
        };

        const movideskUsecases: any = {
          checkMovideskPersonIntegration: async (id: number, doc: string) => {
            expect(id).toBe(participante.id);
            expect(doc).toBe(participante.documento);

            throw new Errors.PreconditionFailedError('...');
          }
        };

        const logger: any = {
          error: (e: any) => {
            expect(e.message).toBe('...');
          }
        };

        const checkParticipantAccessToChatbox = checkParticipantAccessToChatboxUseCase(
          database,
          movideskUsecases,
          logger
        );

        const isParticipante = true;

        const result = await checkParticipantAccessToChatbox(
          participanteId,
          isParticipante,
          null,
          null
        );

        expect(result.integrado).toBe(false);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

  test(
    `
      Should set participanteIntegracao status as (cancelado) because
      there is no matching person at Movidesk, should also return integrado (false)
    `,
    async (done) => {
      try {
        const participanteId = 3;
        const participante = {
          id: 3,
          documento: '50942099060'
        };

        database.entities.participante.findOne = async (config: any) => {
          expect(config.where.id).toBe(participanteId);
          return participante;
        };

        database.entities.participanteIntegracao.update = async (model: any, config: any) => {
          expect(model.status).toBe(ParticipanteIntegracaoStatus.cancelado);
          expect(Object.keys(model).length).toBe(1);

          expect(config.where.participanteId).toBe(participante.id);
          expect(config.where.tipoIntegracao).toBe(ParticipanteIntegracaoTipo.movidesk);
          expect(Object.keys(config.where).length).toBe(2);
        };

        const movideskUsecases: any = {
          checkMovideskPersonIntegration: async (id: number, doc: string) => {
            expect(id).toBe(participante.id);
            expect(doc).toBe(participante.documento);
            return null;
          }
        };

        const logger: any = {
          error: (e: any) => expect(e).toBe(null)
        };

        const checkParticipantAccessToChatbox = checkParticipantAccessToChatboxUseCase(
          database,
          movideskUsecases,
          logger
        );

        const isParticipante = true;

        const result = await checkParticipantAccessToChatbox(
          participanteId,
          isParticipante,
          null,
          null
        );

        expect(result.integrado).toBe(false);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

  test(
    `
      Should return integrado (true) and its (uuidIntegracao) because there is
      an existing person at Movidesk matching this participante
    `,
    async (done) => {
      try {
        const participanteId = 3;
        const participante = {
          id: 3,
          documento: '50942099060'
        };

        database.entities.participante.findOne = async (config: any) => {
          expect(config.where.id).toBe(participanteId);
          return participante;
        };

        database.entities.participanteIntegracao.update = async () => {
          expect('not').toBe('here');
        };

        const person = {
          id: uuid.v4()
        };
        const movideskUsecases: any = {
          checkMovideskPersonIntegration: async (id: number, doc: string) => {
            expect(id).toBe(participante.id);
            expect(doc).toBe(participante.documento);
            return person;
          }
        };

        const logger: any = {
          error: (e: any) => expect(e).toBe(null)
        };

        const checkParticipantAccessToChatbox = checkParticipantAccessToChatboxUseCase(
          database,
          movideskUsecases,
          logger
        );

        const isParticipante = true;
        const userEmail = 'alpe@alpe.com.br';
        const userName = 'Dev It Lab';

        const result = await checkParticipantAccessToChatbox(
          participanteId,
          isParticipante,
          userEmail,
          userName
        );

        expect(result.integrado).toBe(true);
        expect(result.uuidIntegracao).toBe(person.id);
        expect(result.participanteId).toBe(participante.id);
        expect(result.email).toBe(userEmail);
        expect(result.nome).toBe(userName);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

});
