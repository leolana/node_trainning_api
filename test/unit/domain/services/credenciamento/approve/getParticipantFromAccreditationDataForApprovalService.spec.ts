// tslint:disable:no-magic-numbers
import getParticipantFromAccreditationDataForApprovalService from '../../../../../../src/domain/services/credenciamento/approve/getParticipantFromAccreditationDataForApprovalService';
import rateTypeEnum from '../../../../../../src/domain/services/participante/rateTypeEnum';

describe(
  'Domain :: Services :: Credenciamento :: Approve :: getParticipantFromAccreditationDataForApprovalService',
  () => {

    test('Should return a valid participante object model', async (done) => {
      try {
        const credenciamento = {
          dataValues: {
            id: 7,
            createdAt: '2000',
            updatedAt: '2010',
            taxaContratual: {
              antecipacao: 0.798
            }
          },
          contato: {
            dataValues: {
              id: 3
            }
          },
          socios: [
            { dataValues: { id: 10 } },
            { dataValues: { id: 13 } },
            { dataValues: { id: 84 } }
          ],
          domiciliosBancarios: [
            { dataValues: { id: 2 } },
            { dataValues: { id: 90 } },
            { dataValues: { id: 12796 } }
          ]
        };
        const userEmail = 'alpe@alpe.com.br';

        const participante = await getParticipantFromAccreditationDataForApprovalService(
          credenciamento,
          userEmail
        );

        expect(participante).toBeTruthy();
        expect(participante.usuario).toBe(userEmail);

        expect(participante).not.toHaveProperty('id');
        expect(participante).not.toHaveProperty('createdAt');
        expect(participante).not.toHaveProperty('updatedAt');

        expect(participante).toHaveProperty('contatos');
        expect(participante.contatos.length).toBe(1);
        expect(participante.contatos[0]).not.toHaveProperty('id');

        expect(participante).toHaveProperty('socios');
        expect(participante.socios.length).toBe(3);
        participante.socios.forEach((socio: any) => {
          expect(socio).not.toHaveProperty('id');
        });

        expect(participante).toHaveProperty('domiciliosBancarios');
        expect(participante.domiciliosBancarios.length).toBe(3);
        participante.domiciliosBancarios.forEach((domicilioBancario: any) => {
          expect(domicilioBancario).not.toHaveProperty('id');
        });

        expect(participante).toHaveProperty('taxas');
        expect(participante.taxas.length).toBe(1);
        expect(participante.taxas[0].valorInicio).toBe(null);
        expect(participante.taxas[0].valorFim).toBe(null);
        expect(participante.taxas[0].taxa).toBe(credenciamento.dataValues.taxaContratual.antecipacao);
        expect(participante.taxas[0].usuarioCriacao).toBe(userEmail);
        expect(participante.taxas[0].participanteTaxaTipo).toBe(rateTypeEnum.antecipacao);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    });

  }
);
