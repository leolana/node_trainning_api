import deformatDocument from '../document/deformatDocument';

export enum personTypeEnum {
  fisica = 1,
  juridica = 2
}

export const CPF_LENGTH = 11;

/**
 * Retorna (personTypeEnum.fisica) caso o (documento) tenha
 * tamanho de (CPF_LENGTH) caracteres após remover a máscara,
 * caso contrário retornará (personTypeEnum.juridica)
 *
 * @param documento CPF ou CNPJ
 */
export function verifyPersonType(documento: string) {
  return deformatDocument(documento).length === CPF_LENGTH
    ? personTypeEnum.fisica
    : personTypeEnum.juridica;
}

export function getTipoDocumento(documento: string): string {
  return String(documento).length === CPF_LENGTH ? 'CPF' : 'CNPJ';
}

export function getSiglaParticipante(ehFornecedor: boolean): string {
  return ehFornecedor ? 'FN' : 'EC';
}

export default personTypeEnum;
