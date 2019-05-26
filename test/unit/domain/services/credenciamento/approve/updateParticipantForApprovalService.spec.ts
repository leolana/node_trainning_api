// tslint:disable:no-magic-numbers
import database from '../../../../../support/database';
import updateParticipantForApprovalService from '../../../../../../src/domain/services/credenciamento/approve/updateParticipantForApprovalService';
import personTypeEnum from '../../../../../../src/domain/services/participante/personTypeEnum';

describe('Domain :: Services :: Credenciamento :: Approve :: updateParticipantForApprovalService', () => {

  const updateParticipantForApproval = updateParticipantForApprovalService(
    database
  );

  test(
    `
      Should set (.participanteId) for each (contato), (socio), and (domicilioBancario)
      Should update the (participante) with (participanteNovo) data
      Should destroy each (contato), (socio), and (domicilioBancario)
      Should bulkCreate only (conato) and (domicilioBancario)
      Shouldn't bulkCreate (socio) because (participanteNovo.tipoPessoa) is not equal "juridica"
    `,
    async (done) => {
      try {
        const participanteNovo = {
          id: 23,
          tipoPessoa: personTypeEnum.fisica,
          contatos: [
            { participanteId: 19 },
            { participanteId: 19 },
            { participanteId: 19 }
          ],
          socios: [
            { participanteId: 19 },
            { participanteId: 19 },
            { participanteId: 19 }
          ],
          domiciliosBancarios: [
            { participanteId: 19 }
          ]
        };

        database.entities.participante.update = async (model: any, config: any) => {
          expect(model).toBe(participanteNovo);

          expect(config).toHaveProperty('transaction');
          expect(config.where.id).toBe(participanteNovo.id);

          return model;
        };

        ['participanteContato', 'participanteSocio', 'participanteDomicilioBancario'].forEach((entity) => {
          database.entities[entity].destroy = async (config: any) => {
            expect(config).toHaveProperty('transaction');
            expect(config.where.participanteId).toBe(participanteNovo.id);
          };
        });

        ['participanteContato', 'participanteDomicilioBancario'].forEach((entity) => {
          database.entities[entity].bulkCreate = async (models: any[], config: any) => {
            models.forEach((model) => {
              expect(model.participanteId).toBe(participanteNovo.id);
            });
            expect(config).toHaveProperty('transaction');
          };
        });

        database.entities.participanteSocio.bulkCreate = async () => {
          expect('not').toBe('here');
        };

        await updateParticipantForApproval(
          participanteNovo,
          null
        );

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

  test(
    `
      Should set (.participanteId) for each (contato), (socio), and (domicilioBancario)
      Should update the (participante) with (participanteNovo) data
      Should destroy each (contato), (socio), and (domicilioBancario)
      Should bulkCreate each (conato), (socio) and (domicilioBancario)
        because (participanteNovo.tipoPessoa) equals "juridica"
    `,
    async (done) => {
      try {
        const participanteNovo = {
          id: 23,
          tipoPessoa: personTypeEnum.fisica,
          contatos: [
            { participanteId: 19 },
            { participanteId: 19 },
            { participanteId: 19 }
          ],
          socios: [
            { participanteId: 19 },
            { participanteId: 19 },
            { participanteId: 19 }
          ],
          domiciliosBancarios: [
            { participanteId: 19 }
          ]
        };

        database.entities.participante.update = async (model: any, config: any) => {
          expect(model).toBe(participanteNovo);

          expect(config).toHaveProperty('transaction');
          expect(config.where.id).toBe(participanteNovo.id);

          return model;
        };

        ['participanteContato', 'participanteSocio', 'participanteDomicilioBancario'].forEach((entity) => {
          database.entities[entity].destroy = async (config: any) => {
            expect(config).toHaveProperty('transaction');
            expect(config.where.participanteId).toBe(participanteNovo.id);
          };

          database.entities[entity].bulkCreate = async (models: any[], config: any) => {
            models.forEach((model) => {
              expect(model.participanteId).toBe(participanteNovo.id);
            });
            expect(config).toHaveProperty('transaction');
          };
        });

        await updateParticipantForApproval(
          participanteNovo,
          null
        );

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

});
