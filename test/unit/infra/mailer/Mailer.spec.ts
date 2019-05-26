import { validateEmailSubject } from '../../../../src/infra/mailer/Mailer';

describe('Infra :: Mailer :: validateEmailSubject', () => {

  test('Should remove new lines and "\\n" sequences starting with r', async (done) => {
    try {
      const subject = `
        Cessão do \n r
        estabelecimentor\n restaurante
        KanaBrava
      `;

      const result = validateEmailSubject(subject);

      expect(result).toBe('Cessão do estabelecimento restaurante KanaBrava');

    } catch (error) {
      expect(error).toBe(null);
    }

    done();
  });
});
