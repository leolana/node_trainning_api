import * as Exceptions from '../../../../interfaces/rest/exceptions/ApiExceptions';

const setAccreditationNewRateValuesUseCase =

  /**
   * Mapeia em (credenciamentoEdicao) as taxas de débito por bandeira e as taxas administrativas, pegando primeiro
   * os valores presentes no (credenciamentoAnterior), e depois sobrescreve com as novas taxas presente em
   * (credenciamentoEdicao), caso exista um id de taxa presente apenas em (credenciamentoEdicao) uma exception será
   * estourada. Retorna (true) se houve alteração de pelo menos uma taxa, e (false) se todas se mantiveram iguais.
   *
   * @param credenciamentoAnterior O credenciamento que já existe no postgres.
   * @param credenciamentoEdicao O credenciamento que será criado, que foi editado e enviado pelo front.
   */
  async (
    credenciamentoAnterior: any,
    credenciamentoEdicao: any
  ) => {

    let ratesChanged = false;

    const debitRatesMap = {};
    const adminRatesMap = {};

    credenciamentoAnterior.taxasDebito.forEach((taxaDebito: any) => {
      debitRatesMap[taxaDebito.taxaBandeiraId] = taxaDebito;
    });

    credenciamentoAnterior.taxasAdministrativas.forEach((taxaAdministrativa) => {
      adminRatesMap[taxaAdministrativa.taxaAdministrativaId] = taxaAdministrativa;
    });

    const checkIfRatesChanged = (rate1: any, rate2: any) => {
      // tslint:disable-next-line:no-magic-numbers
      if ((+rate1).toFixed(2) !== (+rate2).toFixed(2)) {
        ratesChanged = true;
      }
    };

    credenciamentoEdicao.condicaoComercial.taxasDebito.forEach((taxaDebito: any) => {
      if (taxaDebito.id in debitRatesMap) {
        checkIfRatesChanged(debitRatesMap[taxaDebito.id].valor, taxaDebito.valor);
        debitRatesMap[taxaDebito.id].valor = taxaDebito.valor;
      } else {
        throw new Exceptions.InvalidDebitRateException();
      }
    });

    credenciamentoEdicao.condicaoComercial.taxasAdministrativas.forEach((taxaAdministrativa: any) => {
      if (taxaAdministrativa.id in adminRatesMap) {
        checkIfRatesChanged(adminRatesMap[taxaAdministrativa.id].valor, taxaAdministrativa.valor);
        adminRatesMap[taxaAdministrativa.id].valor = taxaAdministrativa.valor;
      } else {
        throw new Exceptions.InvalidDebitRateException();
      }
    });

    credenciamentoEdicao.condicaoComercial.antecipacao = credenciamentoEdicao.condicaoComercial.taxaContratual;
    credenciamentoEdicao.condicaoComercial.taxaContratual = credenciamentoAnterior.taxaContratualId;

    credenciamentoEdicao.condicaoComercial.taxasDebito = Object
      .keys(debitRatesMap)
      .map(taxaBandeiraId => ({
        id: taxaBandeiraId,
        valor: debitRatesMap[taxaBandeiraId].valor
      }));

    credenciamentoEdicao.condicaoComercial.taxasAdministrativas = Object
      .keys(adminRatesMap)
      .map(taxaAdministrativaId => ({
        id: taxaAdministrativaId,
        valor: adminRatesMap[taxaAdministrativaId].valor
      }));

    return ratesChanged;
  };

export default setAccreditationNewRateValuesUseCase;
