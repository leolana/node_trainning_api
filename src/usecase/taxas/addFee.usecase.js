const searchOverlaps = require('../../service/taxas/searchOverlaps.util');
const validateFee = require('../../service/taxas/validateFee.util');
const addFeeStructure = require('./addFeeStructure.usecase');

module.exports = db => (json, usuario) => {
  const _taxa = {
    tipoPessoa: +json.idTipoPessoa || null,
    ramoAtividadeCodigo: +json.idRamoAtividade || null,
    inicio: new Date(json.inicioVigencia),
    fim: json.terminoVigencia ? new Date(json.terminoVigencia) : null,
    usuario,
  };

  const checkIfOverlaps = _taxa => {
    const action = searchOverlaps(db)(_taxa).then(taxas => {
      const overlaps = taxas.length;
      if (overlaps) {
        throw String('taxa-overlaps');
      }
    });
    return action;
  };

  const createTaxa = () => {
    const action = db.entities.taxa
      .create(_taxa)
      .then(taxa => addFeeStructure(db)(taxa, json, usuario));

    return action;
  };

  return validateFee(_taxa)
    .then(() => checkIfOverlaps(_taxa))
    .then(() => createTaxa())
    .then(fee => fee);
};
