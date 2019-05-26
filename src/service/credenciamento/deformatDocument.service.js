module.exports = (documento) => {
  // Regex para remover pontos e traços do CPF ou CNPJ
  const pattern = /[\\./-]/g;
  return documento.replace(pattern, '');
};
