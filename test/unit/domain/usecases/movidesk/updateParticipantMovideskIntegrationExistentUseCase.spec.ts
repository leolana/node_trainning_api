// tslint:disable:no-magic-numbers
import database from '../../../../support/database';
import updateParticipantMovideskIntegrationExistentUseCase from '../../../../../src/domain/usecases/movidesk/updateParticipantMovideskIntegrationExistentUseCase';
import uuid = require('uuid');
import ParticipanteIntegracaoStatus from '../../../../../src/domain/entities/ParticipanteIntegracaoStatus';
import ParticipanteIntegracaoTipo from '../../../../../src/domain/entities/ParticipanteIntegracaoTipo';

describe('Domain :: UseCases :: Movidesk :: updateParticipantMovideskIntegrationExistentUseCase', () => {

  test(
    `
      Should throw custom exception if invalid participanteId is received
    `,
    async (done) => {
      try {
        const updateParticipantMovideskIntegrationExistent = updateParticipantMovideskIntegrationExistentUseCase(
          database
        );

        const participanteId = null;

        await updateParticipantMovideskIntegrationExistent(
          participanteId,
          null,
          null
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
      Should throw custom exception if uuidIntegracao is missing
    `,
    async (done) => {
      try {
        const updateParticipantMovideskIntegrationExistent = updateParticipantMovideskIntegrationExistentUseCase(
          database
        );

        const participanteId = 19;
        const uuidIntegracao = null;

        await updateParticipantMovideskIntegrationExistent(
          participanteId,
          uuidIntegracao,
          null
        );

        expect('not').toBe('here');

      } catch (error) {
        expect(error.message).toBe('missing-movidesk-code-reference');
      }

      done();
    }
  );

  test(
    `
      Should NOT create participanteIntegracao because
      there are affected rows in the update call
    `,
    async (done) => {
      try {
        const participanteId = 19;
        const uuidIntegracao = uuid.v4();
        const userEmail = 'alpe@alpe.com.br';

        database.entities.participanteIntegracao.update = async (model: any, config: any) => {
          expect(model.id).toBe(uuidIntegracao);
          expect(model.status).toBe(ParticipanteIntegracaoStatus.concluido);
          expect(model.usuario).toBe(userEmail);
          expect(Object.keys(model).length).toBe(3);

          expect(config.where.participanteId).toBe(participanteId);
          expect(config.where.tipoIntegracao).toBe(ParticipanteIntegracaoTipo.movidesk);
          expect(Object.keys(config.where).length).toBe(2);

          return [1];
        };

        database.entities.participanteIntegracao.create = async () => {
          expect('not').toBe('here');
        };

        const updateParticipantMovideskIntegrationExistent = updateParticipantMovideskIntegrationExistentUseCase(
          database
        );

        await updateParticipantMovideskIntegrationExistent(
          participanteId,
          uuidIntegracao,
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
      Should create participanteIntegracao because
      there are ZERO affected rows in the update call
    `,
    async (done) => {
      try {
        const participanteId = 19;
        const uuidIntegracao = uuid.v4();
        const userEmail = 'alpe@alpe.com.br';

        database.entities.participanteIntegracao.update = async (model: any, config: any) => {
          expect(model.id).toBe(uuidIntegracao);
          expect(model.status).toBe(ParticipanteIntegracaoStatus.concluido);
          expect(model.usuario).toBe(userEmail);
          expect(Object.keys(model).length).toBe(3);

          expect(config.where.participanteId).toBe(participanteId);
          expect(config.where.tipoIntegracao).toBe(ParticipanteIntegracaoTipo.movidesk);
          expect(Object.keys(config.where).length).toBe(2);

          return [0];
        };

        database.entities.participanteIntegracao.create = async (model: any) => {
          expect(model.participanteId).toBe(participanteId);
          expect(model.id).toBe(uuidIntegracao);
          expect(model.tipoIntegracao).toBe(ParticipanteIntegracaoTipo.movidesk);
          expect(model.status).toBe(ParticipanteIntegracaoStatus.concluido);
          expect(model.usuario).toBe(userEmail);
          expect(Object.keys(model).length).toBe(5);
        };

        const updateParticipantMovideskIntegrationExistent = updateParticipantMovideskIntegrationExistentUseCase(
          database
        );

        await updateParticipantMovideskIntegrationExistent(
          participanteId,
          uuidIntegracao,
          userEmail
        );

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

});
