// tslint:disable:no-magic-numbers
import sendParticipantToMovideskUseCase from '../../../../../src/domain/usecases/movidesk/sendParticipantToMovideskUseCase';

describe('Domain :: UseCases :: Movidesk :: sendParticipantToMovideskUseCase', () => {

  test(
    `
      Should throw custom exception if Movidesk api fails to create
      person object using participante mapped data
    `,
    async (done) => {
      try {
        const participante = {};
        const userEmail = 'alpe@alpe.com.br';

        const mappedData = {};

        const movideskUseCases: any = {
          mapMovideskPersonDataFromParticipante: async (model: any, email: string) => {
            expect(model).toBe(participante);
            expect(email).toBe(userEmail);
            return mappedData;
          }
        };

        const personApi: any = {
          create: async (person: any) => {
            expect(person).toBe(mappedData);
            return null;
          }
        };

        const sendParticipantToMovidesk = sendParticipantToMovideskUseCase(
          movideskUseCases,
          personApi
        );

        await sendParticipantToMovidesk(
          participante,
          userEmail
        );

        expect('not').toBe('here');

      } catch (error) {
        expect(error.message).toBe('empty-result-from-movidesk');
      }

      done();
    }
  );

  test(
    `
      Should return person object when Movidesk api succeeds creating
      entry from mapped participante data
    `,
    async (done) => {
      try {
        const participante = {};
        const userEmail = 'alpe@alpe.com.br';

        const mappedData = {};
        const movideskUseCases: any = {
          mapMovideskPersonDataFromParticipante: async (model: any, email: string) => {
            expect(model).toBe(participante);
            expect(email).toBe(userEmail);
            return mappedData;
          }
        };

        const personApi: any = {
          create: async (person: any) => {
            expect(person).toBe(mappedData);
            return {};
          }
        };

        const sendParticipantToMovidesk = sendParticipantToMovideskUseCase(
          movideskUseCases,
          personApi
        );

        const result = await sendParticipantToMovidesk(
          participante,
          userEmail
        );

        expect(result).toBe(mappedData);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

});
