/**
 * Retorna o (documento) sem os caracteres de ponto, de traço, e barras
 *
 * @param documento CPF ou CNPJ
 */
function deformatDocument(documento: string) {
  return (documento || '').replace(/[.\/\\-]/g, '');
}

export default deformatDocument;
