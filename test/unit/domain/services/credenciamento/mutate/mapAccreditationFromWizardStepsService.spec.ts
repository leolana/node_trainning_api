import mapAccreditationFromWizardStepsService from '../../../../../../src/domain/services/credenciamento/mutate/mapAccreditationFromWizardStepsService';
import credenciamentoStatusEnum from '../../../../../../src/domain/entities/credenciamentoStatusEnum';
import personTypeEnum from '../../../../../../src/domain/services/participante/personTypeEnum';

describe('Domain :: Services :: Credenciamento :: Mutate :: mapAccreditationFromWizardStepsService', () => {

  test(
    `
      Should map the data coming from wizard steps in the correct way
      so the object model for (credenciamento) can be created without problem
    `,
    async (done) => {
      try {
        const dadosCredenciamento = {
          dadosCadastrais: {
            domiciliosBancarios: [
              { bandeira: { id: 7 }, banco: {}, arquivo: '' },
              { bandeira: { id: 3 }, banco: {}, arquivo: '' }
            ],
            informacoesFinanceiras: {
              faturamentoAnual: {},
              ticketMedio: {}
            },
            contato: {},
            socios: [
              { id: 897 }
            ]
          },
          captura: {
            capturas: []
          },
          instalacao: {},
          condicaoComercial: {
            taxasAdministrativas: [],
            taxasDebito: []
          }
        };

        const statusCredenciamento = credenciamentoStatusEnum.emAnalise;
        const documento = '58.536.497/0001-47';
        const userEmail = 'alpe@alpe.com.br';

        const credenciamento = await mapAccreditationFromWizardStepsService(
          dadosCredenciamento,
          statusCredenciamento,
          documento,
          userEmail
        );

        expect(credenciamento).toBeTruthy();
        expect(Array.isArray(credenciamento.domiciliosBancarios)).toBe(true);

        expect(credenciamento.domiciliosBancarios[0].bandeiraId)
          .toBe(dadosCredenciamento.dadosCadastrais.domiciliosBancarios[1].bandeira.id);

        expect(credenciamento.domiciliosBancarios[1].bandeiraId)
          .toBe(dadosCredenciamento.dadosCadastrais.domiciliosBancarios[0].bandeira.id);

        credenciamento.domiciliosBancarios.forEach((item: any, index: number, array: any[]) => {
          if (index) {
            expect(array[index - 1].bandeiraId).toBeLessThanOrEqual(item.bandeiraId);
          }
          expect(item.arquivo).toBe(null);
        });

        expect(Array.isArray(credenciamento.socios)).toBe(true);
        credenciamento.socios.forEach((socio: any) => {
          expect(socio).not.toHaveProperty('id');
        });

        expect(credenciamento.arquivos).toBeTruthy();
        expect(Array.isArray(credenciamento.arquivos.analises)).toBe(true);

        expect(credenciamento.status).toBe(statusCredenciamento);
        expect(credenciamento.usuario).toBe(userEmail);

        expect(credenciamento).not.toHaveProperty('createdAt');

        expect(credenciamento).not.toHaveProperty('razaoSocial');
        expect(credenciamento).not.toHaveProperty('inscricaoEstadual');
        expect(credenciamento).not.toHaveProperty('inscricaoMunicipal');

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

  test(
    `
      - Should set (credenciamento.createdAt) when there is an already
        created (dadosCredenciamento.credenciamento)
    `,
    async (done) => {
      try {
        const dadosCredenciamento = {
          dadosCadastrais: {
            domiciliosBancarios: [
              { bandeira: { id: 7 }, banco: {}, arquivo: '' },
              { bandeira: { id: 3 }, banco: {}, arquivo: '' }
            ],
            informacoesFinanceiras: {
              faturamentoAnual: {},
              ticketMedio: {}
            },
            contato: {},
            socios: [
              { id: 897 }
            ]
          },
          captura: {
            capturas: []
          },
          instalacao: {},
          condicaoComercial: {
            taxasAdministrativas: [],
            taxasDebito: []
          },
          credenciamento: { createdAt: '2010' }
        };

        const statusCredenciamento = credenciamentoStatusEnum.emAnalise;
        const documento = '58.536.497/0001-47';
        const userEmail = 'alpe@alpe.com.br';

        const credenciamento = await mapAccreditationFromWizardStepsService(
          dadosCredenciamento,
          statusCredenciamento,
          documento,
          userEmail
        );

        expect(credenciamento.createdAt).toBe(dadosCredenciamento.credenciamento.createdAt);

        expect(credenciamento).not.toHaveProperty('razaoSocial');
        expect(credenciamento).not.toHaveProperty('inscricaoEstadual');
        expect(credenciamento).not.toHaveProperty('inscricaoMunicipal');

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

  test(
    `
      - Should set (razaoSocial), (inscricaoEstadual), and (inscricaoMunicipal)
        when its 'tipoPessoa' is 'juridica'
    `,
    async (done) => {
      try {
        const dadosCredenciamento = {
          dadosCadastrais: {
            domiciliosBancarios: [
              { bandeira: { id: 7 }, banco: {}, arquivo: '' },
              { bandeira: { id: 3 }, banco: {}, arquivo: '' }
            ],
            informacoesFinanceiras: {
              faturamentoAnual: {},
              ticketMedio: {}
            },
            contato: {},
            socios: [
              { id: 897 }
            ],
            razaoSocial: 'leleco',
            inscricaoEstadual: '330',
            inscricaoMunicipal: '033'
          },
          captura: {
            capturas: []
          },
          instalacao: {},
          condicaoComercial: {
            taxasAdministrativas: [],
            taxasDebito: []
          },
          tipoPessoa: personTypeEnum.juridica
        };

        const statusCredenciamento = credenciamentoStatusEnum.emAnalise;
        const documento = '58.536.497/0001-47';
        const userEmail = 'alpe@alpe.com.br';

        const credenciamento = await mapAccreditationFromWizardStepsService(
          dadosCredenciamento,
          statusCredenciamento,
          documento,
          userEmail
        );

        expect(credenciamento).not.toHaveProperty('createdAt');

        expect(credenciamento.razaoSocial).toBe(dadosCredenciamento.dadosCadastrais.razaoSocial);
        expect(credenciamento.inscricaoEstadual).toBe(dadosCredenciamento.dadosCadastrais.inscricaoEstadual);
        expect(credenciamento.inscricaoMunicipal).toBe(dadosCredenciamento.dadosCadastrais.inscricaoMunicipal);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

});
