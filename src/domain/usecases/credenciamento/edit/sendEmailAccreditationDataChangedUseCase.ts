import { Mailer } from '../../../../infra/mailer';
import { config } from '../../../../config';

const sendEmailAccreditationDataChangedUseCase = (
  mailer: Mailer,
  mailerSettings: typeof config.mailer
) =>

  /**
   * Apenas se houve alteração de taxa e/ou de dados bancários será enviado um email
   *
   * @param nomeParticipanteAntigo nome do participante antigo
   * @param idParticipanteNovo id do participante novo
   * @param userEmail email do usuário responsável pela alteração
   * @param ratesChanged true se houve alteração nos valores de taxa do participante
   * @param bankingDataChanged true se houve alteração nos domicílios bancários
   */
  async (
    nomeParticipanteAntigo: string,
    idParticipanteNovo: number,
    userEmail: string,
    ratesChanged: boolean,
    bankingDataChanged: boolean
  ) => {
    if (!ratesChanged && !bankingDataChanged) {
      return;
    }

    await mailer.enviar({
      templateName: mailer.emailTemplates.CREDENCIAMENTO_VALORES_ALTERADOS,
      destinatary: mailerSettings.mailingList,
      substitutions: {
        user: userEmail,
        estabelecimento: nomeParticipanteAntigo,
        linkCredenciamento: `${mailerSettings.baseUrl}/credenciamento/${idParticipanteNovo}`,
        taxa: ratesChanged,
        bancario: bankingDataChanged,
      },
    });
  };

export default sendEmailAccreditationDataChangedUseCase;
