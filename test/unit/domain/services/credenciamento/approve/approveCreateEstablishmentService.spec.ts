import database from '../../../../../support/database';
import approveCreateEstablishmentService from '../../../../../../src/domain/services/credenciamento/approve/approveCreateEstablishmentService';

describe('Domain :: Services :: Credenciamento :: Approve :: ApproveCreateEstablishmentService', () => {

  const approveCreateEstablishment = approveCreateEstablishmentService(
    database
  );

  test('Should set "participanteNovo.isAlteracao" when "participanteExistente" is present', async (done) => {
    try {
      const participanteNovo: any = {};
      const participanteExistente = {};

      database.entities.participanteEstabelecimento.create = async () => {
        expect('this function').toBe('ignored');
      };

      await approveCreateEstablishment(
        participanteNovo,
        participanteExistente,
        null
      );

      expect(participanteNovo.isAlteracao).toBe(true);

    } catch (error) {
      expect(error).toBe(null);
    }

    done();
  });

  test('Shouldn\'t set "participanteNovo.isAlteracao" when no "participanteExistente" is present', async (done) => {
    try {
      const participanteNovo: any = {};
      const participanteExistente = null;

      database.entities.participanteEstabelecimento.create = async (model: any, config: any) => {
        expect(model).toHaveProperty('participanteId');
        expect(config).toHaveProperty('transaction');
      };

      await approveCreateEstablishment(
        participanteNovo,
        participanteExistente,
        null
      );

      expect(participanteNovo.isAlteracao).toBeFalsy();

    } catch (error) {
      expect(error).toBe(null);
    }

    done();
  });

});
