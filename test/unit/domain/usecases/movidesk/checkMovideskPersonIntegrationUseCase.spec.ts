// tslint:disable:no-magic-numbers
import checkMovideskPersonIntegrationUseCase from '../../../../../src/domain/usecases/movidesk/checkMovideskPersonIntegrationUseCase';

describe('Domain :: UseCases :: Movidesk :: checkMovideskPersonIntegrationUseCase', () => {

  test(
    `
      Should throw custom exception for invalid participanteId
    `,
    async (done) => {
      try {
        const checkMovideskPersonIntegration = checkMovideskPersonIntegrationUseCase(
          null,
          null
        );

        const participanteId = null;

        await checkMovideskPersonIntegration(
          participanteId,
          null
        );

        expect('not').toBe('here');

      } catch (error) {
        expect(error.message).toBe('invalid-participante-id');
      }

      done();
    }
  );

  test(
    `
      Should throw custom exception for invalid document
    `,
    async (done) => {
      try {
        const checkMovideskPersonIntegration = checkMovideskPersonIntegrationUseCase(
          null,
          null
        );

        const participanteId = 1;
        const participanteDocumento = '...-/\\';

        await checkMovideskPersonIntegration(
          participanteId,
          participanteDocumento
        );

        expect('not').toBe('here');

      } catch (error) {
        expect(error.message).toBe('missing-document');
      }

      done();
    }
  );

  test(
    `
      Should throw custom exception because the found person at Movidesk
      has different document than the document from participante
    `,
    async (done) => {
      try {
        const participanteId = 14;

        const personApi: any = {
          list: async (config: any[]) => {
            expect(Array.isArray(config)).toBe(true);
            expect(config.length).toBe(1);
            expect(config[0].field).toBe('codeReferenceAdditional');
            expect(config[0].value).toBe(participanteId);

            return [
              {
                cpfCnpj: '18599468000100'
              }
            ];
          }
        };

        const checkMovideskPersonIntegration = checkMovideskPersonIntegrationUseCase(
          personApi,
          null
        );

        const participanteDocumento = '00.031.323/0001-42';

        await checkMovideskPersonIntegration(
          participanteId,
          participanteDocumento
        );

        expect('not').toBe('here');

      } catch (error) {
        expect(error.message).toBe('movidesk-document-mismatch');
      }

      done();
    }
  );

  test(
    `
      Should return the found person at Movidesk
      because its document is the same from participante
    `,
    async (done) => {
      try {
        const participanteId = 14;

        const personApi: any = {
          list: async (config: any[]) => {
            expect(Array.isArray(config)).toBe(true);
            expect(config.length).toBe(1);
            expect(config[0].field).toBe('codeReferenceAdditional');
            expect(config[0].value).toBe(participanteId);

            return [
              {
                cpfCnpj: '00031323000142'
              }
            ];
          }
        };

        const logger: any = {
          info: () => null
        };

        const checkMovideskPersonIntegration = checkMovideskPersonIntegrationUseCase(
          personApi,
          logger
        );

        const participanteDocumento = '00.031.323/0001-42';

        const person = await checkMovideskPersonIntegration(
          participanteId,
          participanteDocumento
        );

        expect(person).toBeTruthy();

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

  test(
    `
      Should throw custom exception because userName already exists
      at Movidesk for another codeReferenceAdditional
    `,
    async (done) => {
      try {
        const participanteId = 14;

        const personApi: any = {
          list: async (config: any[]) => {
            expect(Array.isArray(config)).toBe(true);
            expect(config.length).toBe(1);

            if (config[0].field === 'codeReferenceAdditional') {
              expect(config[0].value).toBe(participanteId);
              return null;
            }

            if (config[0].field === 'userName') {
              expect(config[0].value).toBe('00031323000142');
              return [{}];
            }

            return expect('not').toBe('here');
          }
        };

        const checkMovideskPersonIntegration = checkMovideskPersonIntegrationUseCase(
          personApi,
          null
        );

        const participanteDocumento = '00.031.323/0001-42';

        await checkMovideskPersonIntegration(
          participanteId,
          participanteDocumento
        );

        expect('not').toBe('here');

      } catch (error) {
        expect(error.message).toBe('movidesk-username-exists-to-other-participant-id');
      }

      done();
    }
  );

  test(
    `
      Should return null if no matching person is found at Movidesk
      for participante id and documento
    `,
    async (done) => {
      try {
        const participanteId = 14;

        const personApi: any = {
          list: async (config: any[]) => {
            expect(Array.isArray(config)).toBe(true);
            expect(config.length).toBe(1);

            if (config[0].field === 'codeReferenceAdditional') {
              expect(config[0].value).toBe(participanteId);
            }

            if (config[0].field === 'userName') {
              expect(config[0].value).toBe('00031323000142');
            }

            return null;
          }
        };

        const logger: any = {
          info: () => null
        };

        const checkMovideskPersonIntegration = checkMovideskPersonIntegrationUseCase(
          personApi,
          logger
        );

        const participanteDocumento = '00.031.323/0001-42';

        const person = await checkMovideskPersonIntegration(
          participanteId,
          participanteDocumento
        );

        expect(person).toBe(null);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

});
