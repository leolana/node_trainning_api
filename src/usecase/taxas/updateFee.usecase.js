const validateFee = require('../../service/taxas/validateFee.util');
const searchOverlaps = require('../../service/taxas/searchOverlaps.util');
const updateFeeStructure = require('./updateFeeStructure.usecase');
const addFee = require('./addFee.usecase');

module.exports = db => (json, usuario) => {
  const _taxa = {
    inicio: new Date(json.inicioVigencia),
    fim: json.terminoVigencia ? new Date(json.terminoVigencia) : null,
  };

  const getFee = () => {
    const action = db.entities.taxa.findOne({
      where: { id: +json.id },
      include: [
        {
          model: db.entities.taxaBandeira,
          as: 'bandeiras',
          include: [
            {
              model: db.entities.taxaFaturamento,
              as: 'faturamentos',
            },
          ],
        },
        {
          model: db.entities.taxaPrazo,
          as: 'prazos',
          include: [
            {
              model: db.entities.taxaAdministrativa,
              as: 'taxasAdministrativas',
            },
          ],
        },
      ],
    });
    return action.then(taxa => {
      if (!taxa) {
        throw String('taxa-not-found');
      }
      return taxa;
    });
  };

  const sameDate = (dt1, dt2) => {
    const dt1WithoutHours = dt1.toISOString().slice(0, 10);
    const dt2WithoutHours = dt2.toISOString().slice(0, 10);
    return dt1WithoutHours === dt2WithoutHours;
  };

  const checkIfOverlapsAndUpdateFee = taxa => {
    const taxaInicio = new Date(taxa.inicio);
    const taxaNovoInicio = new Date(json.inicioVigencia);

    taxa.inicio = taxaNovoInicio;
    taxa.fim = json.terminoVigencia ? new Date(json.terminoVigencia) : null;
    taxa.usuario = usuario;

    return searchOverlaps(db)(taxa).then(taxas => {
      if (taxas.some(t => t.id !== taxa.id)) {
        throw String('taxa-overlaps');
      }

      if (sameDate(taxaInicio, taxaNovoInicio)) {
        const feeAction = taxa.save();
        const feeStructureAction = updateFeeStructure(db)(taxa, json, usuario);
        return Promise.all([feeAction, feeStructureAction]);
      }

      // atualiza apenas o fim da taxa existente,
      // e cria uma nova taxa com vigência inicial amanhã
      taxa.inicio = taxaInicio;
      taxa.fim = new Date(
        taxaNovoInicio.getFullYear(),
        taxaNovoInicio.getMonth(),
        taxaNovoInicio.getDate() - 1,
      );

      return taxa.save().then(() => addFee(db)(json, usuario));
    });
  };

  return validateFee(_taxa)
    .then(getFee)
    .then(checkIfOverlapsAndUpdateFee);
};
