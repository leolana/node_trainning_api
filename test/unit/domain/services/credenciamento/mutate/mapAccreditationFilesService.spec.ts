import mapAccreditationFilesService from '../../../../../../src/domain/services/credenciamento/mutate/mapAccreditationFilesService';

describe('Domain :: Services :: Credenciamento :: Mutate :: mapAccreditationFilesService', () => {

  test(
    `
      Should loop through (credenciamento.domiciliosBancarios)
    `,
    async (done) => {
      try {
        const originalDomiciliosBancarios = [];

        const credenciamento = {
          domiciliosBancarios: originalDomiciliosBancarios,
          arquivos: {}
        };

        const uploadedFiles: any[] = [];
        const unchangedFiles = null;

        await mapAccreditationFilesService(
          credenciamento,
          uploadedFiles,
          unchangedFiles
        );

        expect(credenciamento.domiciliosBancarios).not.toBe(originalDomiciliosBancarios);
        expect(Array.isArray(credenciamento.domiciliosBancarios)).toBe(true);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

});
