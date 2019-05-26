const DOCUMENT_LENTH = 11;

const personTypeEnum = {
  fisica: 1, // natural-person
  juridica: 2, // legal-person
  verifyPersonType(document) {
    return document.length === DOCUMENT_LENTH
      ? personTypeEnum.fisica
      : personTypeEnum.juridica;
  }
};

export function getTipoDocumento(documento: string): String {

  return String(documento).length === DOCUMENT_LENTH ? 'CPF' : 'CNPJ';
}

export function getSiglaParticipante(ehFornecedor: boolean): String {
  return ehFornecedor ? 'FN' : 'EC';
}

export default personTypeEnum;
