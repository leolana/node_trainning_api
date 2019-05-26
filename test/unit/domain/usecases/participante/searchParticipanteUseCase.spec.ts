import searchParticipantUseCase from '../../../../../src/domain/usecases/participante/searchParticipantUseCase';
import database from '../../../../support/database';

describe('Domain :: UseCases :: Participante :: searchParticipantUseCase', () => {
  const term = 'it la';

  test('Get participants with specific term', async (done) => {
    try {
      database.col = (col: 'col') => null;
      database.fn = () => null;
      database.where = () => null;
      database.entities.participante.findAll = () => ([
        {        }
      ]);
      const searchParticipant = searchParticipantUseCase(database);
      const participantes = await searchParticipant(term);
      expect(Array.isArray(participantes)).toBe(true);
      done();
    } catch (error) {
      expect(error).toBe(null);
    }
  });

});
