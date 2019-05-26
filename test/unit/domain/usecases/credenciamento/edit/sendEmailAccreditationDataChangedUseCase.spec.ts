// tslint:disable:no-magic-numbers
import sendEmailAccreditationDataChangedUseCase from '../../../../../../src/domain/usecases/credenciamento/edit/sendEmailAccreditationDataChangedUseCase';

describe('Domain :: UseCases :: Credenciamento :: Edit :: sendEmailAccreditationDataChangedUseCase', () => {

  test(
    `
      Shouldn't call (mailer.enviar) beucase both (ratesChanged) and (bankingDataChanged) are (false)
    `,
    async (done) => {
      try {

        const nomeParticipanteAntigo = 'Restaurante Kana Brava';
        const idParticipanteNovo = 235;
        const userEmail = 'alpe@alpe.com.br';
        const ratesChanged = false;
        const bankingDataChanged = false;

        const mailer: any = {
          emailTemplates: {},
          enviar: async () => {
            expect('not').toBe('here');
          }
        };

        const mailerSettings: any = {};

        const sendEmailAccreditationDataChanged = await sendEmailAccreditationDataChangedUseCase(
          mailer,
          mailerSettings
        );

        await sendEmailAccreditationDataChanged(
          nomeParticipanteAntigo,
          idParticipanteNovo,
          userEmail,
          ratesChanged,
          bankingDataChanged
        );

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

  test(
    `
      Should call (mailer.enviar) beucase (ratesChanged) is (true)
    `,
    async (done) => {
      try {

        const nomeParticipanteAntigo = 'Restaurante Kana Brava';
        const idParticipanteNovo = 235;
        const userEmail = 'alpe@alpe.com.br';
        const ratesChanged = true;
        const bankingDataChanged = false;

        const mailer: any = {
          emailTemplates: {},
          enviar: async (config: any) => {
            expect(config).toHaveProperty('templateName');
            expect(config).toHaveProperty('destinatary');
            expect(config.substitutions.user).toBe(userEmail);
            expect(config.substitutions.estabelecimento).toBe(nomeParticipanteAntigo);
            expect(config.substitutions.linkCredenciamento).toMatch(new RegExp(`\\/${idParticipanteNovo}$`));
            expect(config.substitutions.taxa).toBe(ratesChanged);
            expect(config.substitutions.bancario).toBe(bankingDataChanged);
          }
        };

        const mailerSettings: any = {};

        const sendEmailAccreditationDataChanged = await sendEmailAccreditationDataChangedUseCase(
          mailer,
          mailerSettings
        );

        await sendEmailAccreditationDataChanged(
          nomeParticipanteAntigo,
          idParticipanteNovo,
          userEmail,
          ratesChanged,
          bankingDataChanged
        );

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

  test(
    `
      Should call (mailer.enviar) beucase (bankingDataChanged) is (true)
    `,
    async (done) => {
      try {

        const nomeParticipanteAntigo = 'Restaurante Kana Brava';
        const idParticipanteNovo = 235;
        const userEmail = 'alpe@alpe.com.br';
        const ratesChanged = false;
        const bankingDataChanged = true;

        const mailer: any = {
          emailTemplates: {},
          enviar: async (config: any) => {
            expect(config).toHaveProperty('templateName');
            expect(config).toHaveProperty('destinatary');
            expect(config.substitutions.user).toBe(userEmail);
            expect(config.substitutions.estabelecimento).toBe(nomeParticipanteAntigo);
            expect(config.substitutions.linkCredenciamento).toMatch(new RegExp(`\\/${idParticipanteNovo}$`));
            expect(config.substitutions.taxa).toBe(ratesChanged);
            expect(config.substitutions.bancario).toBe(bankingDataChanged);
          }
        };

        const mailerSettings: any = {};

        const sendEmailAccreditationDataChanged = await sendEmailAccreditationDataChangedUseCase(
          mailer,
          mailerSettings
        );

        await sendEmailAccreditationDataChanged(
          nomeParticipanteAntigo,
          idParticipanteNovo,
          userEmail,
          ratesChanged,
          bankingDataChanged
        );

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

  test(
    `
      Should call (mailer.enviar) beucase both (ratesChanged) and (bankingDataChanged) are (true)
    `,
    async (done) => {
      try {

        const nomeParticipanteAntigo = 'Restaurante Kana Brava';
        const idParticipanteNovo = 235;
        const userEmail = 'alpe@alpe.com.br';
        const ratesChanged = true;
        const bankingDataChanged = true;

        const mailer: any = {
          emailTemplates: {},
          enviar: async (config: any) => {
            expect(config).toHaveProperty('templateName');
            expect(config).toHaveProperty('destinatary');
            expect(config.substitutions.user).toBe(userEmail);
            expect(config.substitutions.estabelecimento).toBe(nomeParticipanteAntigo);
            expect(config.substitutions.linkCredenciamento).toMatch(new RegExp(`\\/${idParticipanteNovo}$`));
            expect(config.substitutions.taxa).toBe(ratesChanged);
            expect(config.substitutions.bancario).toBe(bankingDataChanged);
          }
        };

        const mailerSettings: any = {};

        const sendEmailAccreditationDataChanged = await sendEmailAccreditationDataChangedUseCase(
          mailer,
          mailerSettings
        );

        await sendEmailAccreditationDataChanged(
          nomeParticipanteAntigo,
          idParticipanteNovo,
          userEmail,
          ratesChanged,
          bankingDataChanged
        );

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

});
