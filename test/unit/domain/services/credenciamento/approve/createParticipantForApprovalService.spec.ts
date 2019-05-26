import database from '../../../../../support/database';
import createParticipantForApprovalService from '../../../../../../src/domain/services/credenciamento/approve/createParticipantForApprovalService';
import personTypeEnum from '../../../../../../src/domain/services/participante/personTypeEnum';

describe('Domain :: Services :: Credenciamento :: Approve :: createParticipantForApprovalService', () => {

  const createParticipantForApproval = createParticipantForApprovalService(
    database
  );

  test(
    `
      Should create a new (participante) using (participanteNovo) data and should include
      (participanteDomicilioBancario), (participanteContato), (participanteTaxa) and should
      include (participanteSocio) because (participanteNovo.tipoPessoa) is equal (personTypeEnum.juridica)
    `,
    async (done) => {
      try {
        const participanteNovo = {
          tipoPessoa: personTypeEnum.juridica
        };

        database.entities.participante.create = async (model: any, config: any) => {
          expect(model).toBe(participanteNovo);

          expect(config).toHaveProperty('transaction');
          expect(config.include.find((i: any) => i.as === 'domiciliosBancarios')).toBeTruthy();
          expect(config.include.find((i: any) => i.as === 'contatos')).toBeTruthy();
          expect(config.include.find((i: any) => i.as === 'taxas')).toBeTruthy();

          expect(config.include.find((i: any) => i.as === 'socios')).toBeTruthy();

          return model;
        };

        const created = await createParticipantForApproval(
          participanteNovo,
          null
        );

        expect(created).toBeTruthy();

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

  test(
    `
      Should create a new (participante) using (participanteNovo) data and should include
      (participanteDomicilioBancario), (participanteContato), (participanteTaxa) and shouldn't
      include (participanteSocio) because (participanteNovo.tipoPessoa) is not equal (personTypeEnum.juridica)
    `,
    async (done) => {
      try {
        const participanteNovo = {
          tipoPessoa: personTypeEnum.fisica
        };

        database.entities.participante.create = async (model: any, config: any) => {
          expect(model).toBe(participanteNovo);

          expect(config).toHaveProperty('transaction');
          expect(config.include.find((i: any) => i.as === 'domiciliosBancarios')).toBeTruthy();
          expect(config.include.find((i: any) => i.as === 'contatos')).toBeTruthy();
          expect(config.include.find((i: any) => i.as === 'taxas')).toBeTruthy();

          expect(config.include.find((i: any) => i.as === 'socios')).toBeFalsy();

          return model;
        };

        const created = await createParticipantForApproval(
          participanteNovo,
          null
        );

        expect(created).toBeTruthy();

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

});
