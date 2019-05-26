module.exports = db => (idTaxaBandeira, novosFaturamentos, usuario) => {
  const createTaxasFaturamentos = [];

  novosFaturamentos.forEach(faturamento => {
    const createTaxaFaturamento = db.entities.taxaFaturamento.create({
      coeficiente: faturamento.coeficiente,
      faturamentoCartaoId: faturamento.idFaturamento,
      taxaBandeiraId: idTaxaBandeira,
      usuario,
    });

    createTaxasFaturamentos.push(createTaxaFaturamento);
  });

  return Promise.all(createTaxasFaturamentos);
};
