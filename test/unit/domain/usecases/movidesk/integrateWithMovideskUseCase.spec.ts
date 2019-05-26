import database from '../../../../support/database';
import integrateWithMovideskUseCase from '../../../../../src/domain/usecases/movidesk/integrateWithMovideskUseCase';
import * as Exceptions from '../../../../../src/interfaces/rest/exceptions/ApiExceptions';
import * as uuid from 'uuid';
import { config } from '../../../../../src/config';

describe('Domain :: UseCases :: Movidesk :: IntegrateWithMovideskUseCase', () => {
  config.movidesk.enabled = true;
  const personApi: any = {};
  const logger: any = { warn: () => 1, error: () => 1 };
  const notificationUseCases: any = { addNotification: async () => 0 };
  const integrateWithMovidesk = integrateWithMovideskUseCase(database, personApi, logger, notificationUseCases);

  const participanteId = 1;
  const user = 'test@mail.com';

  test('The create method from personApi will work as expected and the result should be true', async (done) => {
    database.entities.participante.findOne = async () => ({ contatos: [], cidade: {} });
    personApi.create = async () => ({ id: uuid.v4() });
    database.entities.participanteIntegracao.create = async () => null;
    database.transaction = async () => ({
      commit: async () => null,
      rollback: async () => null
    });

    const throwErrors = true;
    const answer = await integrateWithMovidesk(participanteId, user, throwErrors);
    expect(answer).toBe(true);
    done();
  });

  test('Some error will be thrown', async (done) => {
    database.entities.participante.findOne = async () => { throw new Exceptions.ParticipanteNotFoundException(); };

    try {
      const throwErrors = true;
      await integrateWithMovidesk(participanteId, user, throwErrors);
      expect('not').toBe('here');
    } catch (e) {
      expect(e.message).toBe('participante-nao-encontrado');
    }
    done();
  });

  test('Some error will be thrown from personApi', async (done) => {
    database.entities.participante.findOne = async () => ({ contatos: [], cidade: {} });
    personApi.create = async () => { throw new Exceptions.InvalidSentDataException(); };

    try {
      const throwErrors = true;
      await integrateWithMovidesk(participanteId, user, throwErrors);
      expect('not').toBe('here');
    } catch (e) {
      expect(e.message).toBe('invalid-sent-data');
    }
    done();
  });

  test('Any error should be hidden if the third argument is false', async (done) => {
    database.entities.participante.findOne = async () => { throw new Exceptions.ParticipanteNotFoundException(); };

    const throwErrors = false;
    const answer = await integrateWithMovidesk(participanteId, user, throwErrors);
    expect(answer).toBe(true);
    done();
  });

  test('Should throw error if participanteId isNaN', async (done) => {
    try {
      const throwErrors = true;
      await integrateWithMovidesk(NaN, user, throwErrors);
      expect('not').toBe('here');
    } catch (e) {
      expect(e.message).toBe('participante-nao-encontrado');
    }
    done();
  });
});
