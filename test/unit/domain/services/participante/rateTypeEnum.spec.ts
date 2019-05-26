// tslint:disable:no-magic-numbers
import rateTypeEnum from '../../../../../src/domain/services/participante/rateTypeEnum';

describe('Domain :: Services :: Participante :: rateTypeEnum', () => {

  const knownPairs: [string, number][] = [
    ['cessao', 1],
    ['antecipacao', 2]
  ];

  test(
    `
      Should have specific defined pair of key values
    `,
    async (done) => {
      try {

        knownPairs.forEach(([key, value]: any) => {
          expect(rateTypeEnum[key]).toBe(value);
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

        Object.values(rateTypeEnum).forEach((existing: any) => {
          const known = [].concat(...knownPairs).find((x: any) => x === existing);
          expect(existing).toBe(known);
        });

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

});
