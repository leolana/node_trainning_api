// tslint:disable:no-magic-numbers
import database from '../../../../../support/database';
import findAccreditationParticipantUseCase from '../../../../../../src/domain/usecases/credenciamento/edit/findAccreditationParticipantUseCase';

describe('Domain :: UseCases :: Credenciamento :: Edit :: findAccreditationParticipantUseCase', () => {

  test(
    `
      Should throw specific exception when there is no found (participante)
    `,
    async (done) => {
      try {

        const credenciamentoId = 89;

        database.entities.participante.findOne = async (config: any) => {
          expect(config.include.length).toBe(4);
          expect(config.include.find((i: any) => i.as === 'contatos')).toBeTruthy();
          expect(config.include.find((i: any) => i.as === 'domiciliosBancarios')).toBeTruthy();
          expect(config.include.find((i: any) => i.as === 'taxas')).toBeTruthy();

          const includeCredenciamento = config.include.find(
            (i: any) => i.as === 'credenciamentos'
          );
          expect(includeCredenciamento).toBeTruthy();

          expect(includeCredenciamento.include.length).toBe(2);
          expect(includeCredenciamento.include.find((i: any) => i.as === 'taxasAdministrativas')).toBeTruthy();
          expect(includeCredenciamento.include.find((i: any) => i.as === 'taxasDebito')).toBeTruthy();

          return null;
        };

        const findAccreditationParticipant = await findAccreditationParticipantUseCase(
          database
        );

        await findAccreditationParticipant(
          credenciamentoId
        );

        expect('not').toBe('here');

      } catch (error) {
        expect(error.message).toBe('participante-nao-encontrado');
      }

      done();
    }
  );

  test(
    `
      Should throw specific exception when there is (participante)
      but NOT (participante.credenciamentos)
    `,
    async (done) => {
      try {

        const credenciamentoId = 89;

        database.entities.participante.findOne = async (config: any) => {
          expect(config.include.length).toBe(4);
          expect(config.include.find((i: any) => i.as === 'contatos')).toBeTruthy();
          expect(config.include.find((i: any) => i.as === 'domiciliosBancarios')).toBeTruthy();
          expect(config.include.find((i: any) => i.as === 'taxas')).toBeTruthy();

          const includeCredenciamento = config.include.find(
            (i: any) => i.as === 'credenciamentos'
          );
          expect(includeCredenciamento).toBeTruthy();

          expect(includeCredenciamento.include.length).toBe(2);
          expect(includeCredenciamento.include.find((i: any) => i.as === 'taxasAdministrativas')).toBeTruthy();
          expect(includeCredenciamento.include.find((i: any) => i.as === 'taxasDebito')).toBeTruthy();

          return {};
        };

        const findAccreditationParticipant = await findAccreditationParticipantUseCase(
          database
        );

        await findAccreditationParticipant(
          credenciamentoId
        );

        expect('not').toBe('here');

      } catch (error) {
        expect(error.message).toBe('credenciamento-nao-localizado');
      }

      done();
    }
  );

  test(
    `
      Should work without errors when (participante.credenciamentos) is found
    `,
    async (done) => {
      try {

        const credenciamentoId = 89;
        const participante = {
          credenciamentos: [{}]
        };

        database.entities.participante.findOne = async (config: any) => {
          expect(config.include.length).toBe(4);
          expect(config.include.find((i: any) => i.as === 'contatos')).toBeTruthy();
          expect(config.include.find((i: any) => i.as === 'domiciliosBancarios')).toBeTruthy();
          expect(config.include.find((i: any) => i.as === 'taxas')).toBeTruthy();

          const includeCredenciamento = config.include.find(
            (i: any) => i.as === 'credenciamentos'
          );
          expect(includeCredenciamento).toBeTruthy();

          expect(includeCredenciamento.include.length).toBe(2);
          expect(includeCredenciamento.include.find((i: any) => i.as === 'taxasAdministrativas')).toBeTruthy();
          expect(includeCredenciamento.include.find((i: any) => i.as === 'taxasDebito')).toBeTruthy();

          return participante;
        };

        const findAccreditationParticipant = await findAccreditationParticipantUseCase(
          database
        );

        const result = await findAccreditationParticipant(
          credenciamentoId
        );

        expect(result.participanteExistente).toBe(participante);
        expect(result.credenciamentoAnterior).toBe(participante.credenciamentos[0]);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

});
