import getProviderNomineesUseCase from '../../../../../src/domain/usecases/participante/getProviderNomineesUseCase';
import database from '../../../../support/database';

describe('Domain :: UseCases :: Participante :: getProviderNominees', () => {
  const idEstabelecimento = 1;

  test('Successfully get Provider Nominees', async (done) => {
    try {
      database.entities.participanteIndicacao.findAll = async () => ([{}]);

      database.entities.participanteEstabelecimento.findOne = async () => ({
        participante: {
          id: 1,
          documento: '33312548585'
        }
      });

      const getProviderNominees = getProviderNomineesUseCase(database);
      const indicacoes = await getProviderNominees(idEstabelecimento);

      expect(Array.isArray(indicacoes)).toBe(true);
      done();
    } catch (error) {
      expect(error).toBe(null);
    }

  });

  test('try to getProviderNominees and throws ParticipanteNotFoundException', async (done) => {
    try {
      database.entities.participanteEstabelecimento.findOne = async () => null;

      const getProviderNominees = getProviderNomineesUseCase(database);
      await getProviderNominees(idEstabelecimento);
      expect('not').toBe('here');
    } catch (error) {
      expect(error.message).toBe('participante-nao-encontrado');
    }
    done();
  });

});
