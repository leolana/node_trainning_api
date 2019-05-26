// tslint:disable:no-magic-numbers
import termoTypeEnum from '../../../../../src/domain/services/termo/termoTypeEnum';

describe('Domain :: Services :: Termo :: termoTypeEnum', () => {

  const knownPairs: [string, number][] = [
    ['aditivo', 1],
    ['contratoMaeFornecedor', 2],
    ['contratoMaeEstabelecimento', 3]
  ];

  test(
    `
      Should have specific defined pair of key values
    `,
    async (done) => {
      try {

        knownPairs.forEach(([key, value]: any) => {
          expect(termoTypeEnum[key]).toBe(value);
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

        Object.values(termoTypeEnum).forEach((existing: any) => {
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
