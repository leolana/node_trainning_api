// tslint:disable:no-magic-numbers
import uploadAccreditationFilesService from '../../../../../../src/domain/services/credenciamento/mutate/uploadAccreditationFilesService';

describe('Domain :: Services :: Credenciamento :: Mutate :: uploadAccreditationFilesService', () => {

  test(
    `
      Should call upload service for each item in (arquivos)
      Should have correct name for each mapped file
    `,
    async (done) => {
      try {

        const arquivos = [
          { fieldname: 'example__10', originalname: 'test10.pdf', buffer: '...' },
          { fieldname: 'example__20', originalname: 'test20.pdf', buffer: '...' },
          { fieldname: 'example__30', originalname: 'test30.pdf', buffer: '...' }
        ];

        const documento = '58.536.497/0001-47';
        let count = 0;

        const fileStorage: any = {
          upload: async (name: string, fileContent: string) => {
            expect(fileContent).toBe('...');

            const parts = name.split('/');
            expect(parts.length).toBe(5);

            expect(parts[0]).toBe('credenciamento');
            expect(parts[1]).toBe('58536497000147');
            expect(parts[2]).toBe('example__');
            expect(parts[3]).toMatch(/^\d{4}\-\d{2}\-\d{2}T\d{2}\-\d{2}\-\d{2}\-\d{3}Z$/);
            expect(parts[4]).toMatch(/^test[123]0\.pdf$/);

            count += 1;
          }
        };

        const uploadAccreditationFiles = uploadAccreditationFilesService(
          fileStorage
        );

        const uploadedFiles = await uploadAccreditationFiles(
          arquivos,
          documento
        );

        expect(Array.isArray(uploadedFiles)).toBe(true);
        expect(count).toBe(arquivos.length);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

});
