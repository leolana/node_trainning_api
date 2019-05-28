import getBondsUseCase from '../../../../../src/domain/usecases/vinculo/getBondsUseCase';
import database from '../../../../support/database';
import participanteVinculoStatus from '../../../../../src/domain/entities/participanteVinculoStatus';

describe('Domain :: UseCases :: Participante :: getBonds', () => {
  const identityName = 'participanteEstabelecimento';
  const id = 1;
  const statusVinculo = participanteVinculoStatus.reprovado;

  test('Successfully get bonds from establishment', async (done) => {
    const solicitadoEstabelecimento = true;
    try {
      database.entities[identityName].findOne = async (config: any) => {
        expect(config.where.participanteId).toBe(id);
        expect(config.include[0].where.status).toBe(statusVinculo);
        expect(Array.isArray(config.include)).toBe(true);

        return {
          vinculos: [
            {
              fornecedor: {
                dataValues: {
                  participante: {}
                }
              },
              recusa: {
                motivoRecusa: {
                  requerObservacao: true,
                  motivoRecusaObservacao: 'recusa obs',
                }
              }
            }
          ]
        };
      };

      const getBonds = getBondsUseCase(database);
      const vinculos = await getBonds(identityName, solicitadoEstabelecimento, id, statusVinculo);
      expect(Array.isArray(vinculos)).toBe(true);
      done();
    } catch (error) {
      expect(error).toBe(null);
    }
  });

  test('Successfully get bonds from provider', async (done) => {
    const solicitadoEstabelecimento = false;
    try {
      database.entities[identityName].findOne = async (config: any) => {
        expect(config.where.participanteId).toBe(id);
        expect(config.include[0].where.status).toBe(statusVinculo);
        expect(Array.isArray(config.include)).toBe(true);

        return {
          vinculos: [
            {
              estabelecimento: {
                dataValues: {
                  participante: {}
                }
              },
              recusa: {
                motivoRecusa: {
                  requerObservacao: true,
                  motivoRecusaObservacao: 'recusa obs',
                }
              }
            }
          ]
        };
      };

      const getBonds = getBondsUseCase(database);
      const vinculos = await getBonds(identityName, solicitadoEstabelecimento, id, statusVinculo);
      expect(Array.isArray(vinculos)).toBe(true);
      done();
    } catch (error) {
      expect(error).toBe(null);
    }
  });

  test('Get 0 bonds from provider', async (done) => {
    const solicitadoEstabelecimento = false;
    try {
      database.entities[identityName].findOne = async (config: any) => {
        expect(config.where.participanteId).toBe(id);
        expect(config.include[0].where.status).toBe(statusVinculo);
        expect(Array.isArray(config.include)).toBe(true);

        return null;
      };

      const getBonds = getBondsUseCase(database);
      const vinculos = await getBonds(identityName, solicitadoEstabelecimento, id, statusVinculo);
      expect(Array.isArray(vinculos)).toBe(true);
      expect(vinculos.length).toBe(0);
      done();
    } catch (error) {
      expect(error).toBe(null);
    }

  });

});
