import addFeeRevenues from './addFeeRevenues';

const addFeeFlags = db => (idTaxa, novasBandeiras, usuario) => {
  const $addFeeRevenues = addFeeRevenues(db);

  const createTaxasBandeiras = [];

  novasBandeiras.forEach((bandeira: any) => {
    const createTaxaBandeira = db.entities.taxaBandeira
      .create({
        usuario,
        taxaId: idTaxa,
        bandeiraId: bandeira.idBandeira,
        taxaDebito: bandeira.taxaDebito,
      })
      .then((taxaBandeira) => {
        const createTaxasFaturamentos = $addFeeRevenues(
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

export default addFeeFlags;
