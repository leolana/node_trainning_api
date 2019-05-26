const addFeeRevenues = db => (idTaxaBandeira, novosFaturamentos, usuario) => {
  const createTaxasFaturamentos = [];

  novosFaturamentos.forEach((faturamento) => {
    const createTaxaFaturamento = db.entities.taxaFaturamento.create({
      usuario,
      coeficiente: faturamento.coeficiente,
      faturamentoCartaoId: faturamento.idFaturamento,
      taxaBandeiraId: idTaxaBandeira,
    });

    createTaxasFaturamentos.push(createTaxaFaturamento);
  });

  return Promise.all(createTaxasFaturamentos);
};

export default addFeeRevenues;
