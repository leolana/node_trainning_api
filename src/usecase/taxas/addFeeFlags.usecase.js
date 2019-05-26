const addTaxasFaturamentos = require('./addFeeRevenues.usecase');

module.exports = db => (idTaxa, novasBandeiras, usuario) => {
  const $addTaxasFaturamentos = addTaxasFaturamentos(db);

  const createTaxasBandeiras = [];

  novasBandeiras.forEach(bandeira => {
    const createTaxaBandeira = db.entities.taxaBandeira
      .create({
        taxaId: idTaxa,
        bandeiraId: bandeira.idBandeira,
        taxaDebito: bandeira.taxaDebito,
        usuario,
      })
      .then(taxaBandeira => {
        const createTaxasFaturamentos = $addTaxasFaturamentos(
          taxaBandeira.id,
          bandeira.faturamentos,
          usuario,
        );
        return createTaxasFaturamentos;
      });

    createTaxasBandeiras.push(createTaxaBandeira);
  });

  return Promise.all(createTaxasBandeiras);
};
