// tslint:disable:no-magic-numbers

const tariffs = siscofWrapper => (supplierId) => {
  const assembleData = data => ({
    taxasCessao: data.taxas.map(c => ({
      valorInicio: c.valorInicio,
      valorFim: c.valorFim,
      taxa: c.taxaCessao / 100,
    })),
    taxaAntecipacao: data.taxaAntecipacao / 100,
  });

  return siscofWrapper.consultarTarifaCessionario(supplierId)
    .then(assembleData);
};

export default tariffs;
