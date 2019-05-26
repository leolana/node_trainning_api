import deformatDocument from '../../../../../src/domain/services/credenciamento/deformatDocument';

describe('Domain :: Services :: Credenciamento :: deformatDocument', () => {

  test(
    `
      Should return only the numbers from a masked CPF
    `,
    async (done) => {
      try {
        const documento = '155.023.820-52';

        const result = deformatDocument(
          documento
        );

        expect(result).toBe('15502382052');

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

  test(
    `
      Shouldn't remove letters
    `,
    async (done) => {
      try {
        const documento = '343.745.890-XX';

        const result = deformatDocument(
          documento
        );

        expect(result).toBe('343745890XX');

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

  test(
    `
      Should work as well for CNPJ removing also the slash
    `,
    async (done) => {
      try {
        const documento = '28.252.392/0001-03';

        const result = deformatDocument(
          documento
        );

        expect(result).toBe('28252392000103');

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

  test(
    `
      Should work also removing BACKslashes
    `,
    async (done) => {
      try {
        const documento = '28.252.392\\0001-03';

        const result = deformatDocument(
          documento
        );

        expect(result).toBe('28252392000103');

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

  test(
    `
      Shouldn't change the input if it only has numbers
    `,
    async (done) => {
      try {
        const documento = '30084847000162';

        const result = deformatDocument(
          documento
        );

        expect(result).toBe(documento);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

  test(
    `
      Should return empty string its input is undefined
    `,
    async (done) => {
      try {
        const documento = undefined;

        const result = deformatDocument(
          documento
        );

        expect(result).toBe('');

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

});
