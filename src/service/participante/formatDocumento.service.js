module.exports = (documento) => {
  const documentFormat = `${documento.substring(0, 2)}.`
    + `${documento.substring(2, 5)}.`
    + `${documento.substring(5, 8)}/`
    + `${documento.substring(8, 12)}-`
    + `${documento.substring(12, 14)}`;
  return documentFormat;
};
