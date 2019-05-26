import database from '../../../../../support/database';
import createAccreditationService from '../../../../../../src/domain/services/credenciamento/mutate/createAccreditationService';
import personTypeEnum from '../../../../../../src/domain/services/participante/personTypeEnum';

describe('Domain :: Services :: Credenciamento :: Mutate :: createAccreditationService', () => {

  const createAccreditation = createAccreditationService(
    database
  );

  test(
    `
      Should insert (credenciamento) in postgres, and should also insert its associations
      - (credenciamentoDomicilioBancario) -> domiciliosBancarios
      - (credenciamentoCaptura) -> capturas
      - (credenciamentoInstalacao) -> instalacao
      - (credenciamentoTaxaAdministrativa) -> taxasAdministrativas
      - (credenciamentoTaxaDebito) -> taxasDebito
      - (credenciamentoAprovacao) -> historicoAprovacao
      - (credenciamentoContato) -> contato
      Should also insert the association for (credenciamentoSocio) -> socios
      because (credenciamento.tipoPessoa) is 'juridica'
    `,
    async (done) => {
      try {
        const credenciamento = {
          tipoPessoa: personTypeEnum.juridica
        };

        database.entities.credenciamento.create = async (model: any, config: any) => {
          expect(model).toBe(credenciamento);
          expect(config).toHaveProperty('transaction');
          expect(config.returning).toBe(true);

          const associations = [
            'domiciliosBancarios',
            'capturas',
            'instalacao',
            'taxasAdministrativas',
            'taxasDebito',
            'historicoAprovacao',
            'contato',
            'socios'
          ];

          associations.forEach((association) => {
            const found = config.include.find((i: any) => i.as === association);
            expect(found && found.as).toBe(association);
          });

          return model;
        };

        const created = await createAccreditation(
          credenciamento,
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
      Should insert (credenciamento) in postgres, and should also insert its associations
      - (credenciamentoDomicilioBancario) -> domiciliosBancarios
      - (credenciamentoCaptura) -> capturas
      - (credenciamentoInstalacao) -> instalacao
      - (credenciamentoTaxaAdministrativa) -> taxasAdministrativas
      - (credenciamentoTaxaDebito) -> taxasDebito
      - (credenciamentoAprovacao) -> historicoAprovacao
      - (credenciamentoContato) -> contato
      Should NOT insert the association for (credenciamentoSocio) -> socios
      because (credenciamento.tipoPessoa) is NOT 'juridica'
    `,
    async (done) => {
      try {
        const credenciamento = {
          tipoPessoa: personTypeEnum.fisica
        };

        database.entities.credenciamento.create = async (model: any, config: any) => {
          expect(model).toBe(credenciamento);
          expect(config).toHaveProperty('transaction');
          expect(config.returning).toBe(true);

          const associations = [
            'domiciliosBancarios',
            'capturas',
            'instalacao',
            'taxasAdministrativas',
            'taxasDebito',
            'historicoAprovacao',
            'contato'
          ];

          associations.forEach((association) => {
            const found = config.include.find((i: any) => i.as === association);
            expect(found && found.as).toBe(association);
          });

          expect(config.include.find((i: any) => i.as === 'socios')).toBeFalsy();

          return model;
        };

        const created = await createAccreditation(
          credenciamento,
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
