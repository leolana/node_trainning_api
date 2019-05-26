/**
 * Retorna se houve mudança nos dados bancários do participante.
 *
 * @param participanteAntigo Objeto da model de participante contendo os (domiciliosBancarios) antigos
 * @param participanteNovo Objeto da model de participante contendo os (domiciliosBancarios) novos
 */
const checkIfBankingDataChangedUseCase = async (
  participanteAntigo: any,
  participanteNovo: any
) => {
  const bankingDataMap = {};

  participanteAntigo.domiciliosBancarios.forEach((domicilioBancario: any) => {
    bankingDataMap[domicilioBancario.bandeiraId] = domicilioBancario;
  });

  const someChangeHappened = <boolean>participanteNovo.domiciliosBancarios.some((novo: any) => {
    const jaExiste = participanteAntigo.domiciliosBancarios.find(
      (antigo: any) => antigo.bandeiraId === novo.bandeiraId
    );

    if (jaExiste) {
      const keys = ['bancoNome', 'agencia', 'conta', 'digito', 'arquivo'];
      return keys.some(key => jaExiste[key] !== novo[key]);
    }

    return true;
  });

  return someChangeHappened;
};

export default checkIfBankingDataChangedUseCase;
