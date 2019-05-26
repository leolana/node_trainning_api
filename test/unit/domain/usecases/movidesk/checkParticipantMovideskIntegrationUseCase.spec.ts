import database from '../../../../support/database';
import checkParticipantMovideskIntegrationUseCase from '../../../../../src/domain/usecases/movidesk/checkParticipantMovideskIntegrationUseCase';
import { config } from '../../../../../src/config';

describe('Domain :: UseCases :: Movidesk :: CheckParticipantMovideskIntegrationUseCase', () => {
  const checkParticipantMovideskIntegration = checkParticipantMovideskIntegrationUseCase(database);
  config.movidesk.enabled = true;

  test('Should throw an error if no valid participanteId is set', async (done) => {
    try {
      const participanteId = NaN;
      await checkParticipantMovideskIntegration(participanteId);
      expect('not').toBe('here');
    } catch (e) {
      expect(e.message).toBe('invalid-participante-id');
    }
    done();
  });

  test('Should return false when findOne returns null', async (done) => {
    database.entities.participanteIntegracao.findOne = async () => null;

    const participanteId = 1;

    const result = await checkParticipantMovideskIntegration(participanteId);

    expect(result).toBe(false);
    done();
  });

  test('Should return true when findOne succeeds', async (done) => {
    database.entities.participanteIntegracao.findOne = async () => ({});

    const participanteId = 1;
    const result = await checkParticipantMovideskIntegration(participanteId);

    expect(result).toBe(true);
    done();
  });
});
