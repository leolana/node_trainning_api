// tslint:disable:no-magic-numbers
import { verifyPersonType, personTypeEnum } from '../../../../../src/domain/services/participante/personTypeEnum';

describe('Domain :: Services :: Participante :: personTypeEnum', () => {

  const knownPairs: [string, number][] = [
    ['fisica', 1],
    ['juridica', 2]
  ];

  test(
    `
      Should have specific defined pair of key values
    `,
    async (done) => {
      try {

        knownPairs.forEach(([key, value]: any) => {
          expect(personTypeEnum[key]).toBe(value);
        });

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

  test(
    `
      Shouldn't have unknown (key:value) pairs
    `,
    async (done) => {
      try {

        Object.values(personTypeEnum).forEach((existing: any) => {
          const known = [].concat(...knownPairs).find((x: any) => x === existing);
          expect(existing).toBe(known);
        });

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

  test(
    `
      Should return (personTypeEnum.fisica) because (documento) is of (CPF_LENGTH)
    `,
    async (done) => {
      try {
        const documento = '94810851044';

        const result = verifyPersonType(
          documento
        );

        expect(result).toBe(personTypeEnum.fisica);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

  test(
    `
      Should return (personTypeEnum.fisica) because (documento) is of (CPF_LENGTH)
      after removing its mask
    `,
    async (done) => {
      try {
        const documento = '948.108.510-44';

        const result = verifyPersonType(
          documento
        );

        expect(result).toBe(personTypeEnum.fisica);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

  test(
    `
      Should return (personTypeEnum.fisica) because (documento) is of (CPF_LENGTH)
      after removing its mask. Should count the two X's.
    `,
    async (done) => {
      try {
        const documento = '948.108.510-XX';

        const result = verifyPersonType(
          documento
        );

        expect(result).toBe(personTypeEnum.fisica);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

  test(
    `
      Should return (personTypeEnum.juridica) because (documento) is empty
    `,
    async (done) => {
      try {
        const documento = '';

        const result = verifyPersonType(
          documento
        );

        expect(result).toBe(personTypeEnum.juridica);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

  test(
    `
      Should return (personTypeEnum.juridica) because (documento) is a CNPJ
    `,
    async (done) => {
      try {
        const documento = '39928936000XXX';

        const result = verifyPersonType(
          documento
        );

        expect(result).toBe(personTypeEnum.juridica);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

});
