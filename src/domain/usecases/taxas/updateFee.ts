import validateFee from '../../services/taxas/validateFee';
import searchOverlaps from '../../services/taxas/searchOverlaps';
import updateFeeStructure from './updateFeeStructure';
import addFee from './addFee';

const updateFee = db => (json, usuario) => {
  const taxa: any = {
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
    return action.then((fee) => {
      if (!fee) {
        throw new Error('taxa-not-found');
      }
      return fee;
    });
  };

  const sameDate = (dt1, dt2) => {
    const position = 10;
    const dt1WithoutHours = dt1.toISOString().slice(0, position);
    const dt2WithoutHours = dt2.toISOString().slice(0, position);
    return dt1WithoutHours === dt2WithoutHours;
  };

  const checkIfOverlapsAndUpdateFee = (fee: any) => {
    const taxaInicio = new Date(fee.inicio);
    const taxaNovoInicio = new Date(json.inicioVigencia);

    fee.inicio = taxaNovoInicio;
    fee.fim = json.terminoVigencia ? new Date(json.terminoVigencia) : null;
    fee.usuario = usuario;

    return searchOverlaps(db)(fee).then((taxas: any) => {
      if (taxas.some(t => t.id !== fee.id)) {
        throw new Error('taxa-overlaps');
      }

      if (sameDate(taxaInicio, taxaNovoInicio)) {
        const feeAction = fee.save();
        const feeStructureAction = updateFeeStructure(db)(fee, json, usuario);
        return Promise.all([feeAction, feeStructureAction]);
      }

      // atualiza apenas o fim da taxa existente,
      // e cria uma nova taxa com vigência inicial amanhã
      fee.inicio = taxaInicio;
      fee.fim = new Date(
        taxaNovoInicio.getFullYear(),
        taxaNovoInicio.getMonth(),
        taxaNovoInicio.getDate() - 1,
      );

      return fee.save().then(() => addFee(db)(json, usuario));
    });
  };

  return validateFee(taxa)
    .then(getFee)
    .then(checkIfOverlapsAndUpdateFee);
};

export default updateFee;
