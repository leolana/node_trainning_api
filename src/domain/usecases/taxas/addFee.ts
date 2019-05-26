import searchOverlaps from '../../services/taxas/searchOverlaps';
import validateFee from '../../services/taxas/validateFee';
import addFeeStructure from './addFeeStructure';

const addFee = db => (json, usuario) => {
  const taxa = {
    usuario,
    tipoPessoa: +json.idTipoPessoa || null,
    ramoAtividadeCodigo: +json.idRamoAtividade || null,
    inicio: new Date(json.inicioVigencia),
    fim: json.terminoVigencia ? new Date(json.terminoVigencia) : null,
  };

  const checkIfOverlaps = (taxaToCheck: any) => {
    const action = searchOverlaps(db)(taxaToCheck)
      .then((taxas: any) => {
        const overlaps = taxas.length;
        if (overlaps) {
          throw new Error('taxa-overlaps');
        }
      });
    return action;
  };

  const createTaxa = () => {
    const action = db.entities.taxa
      .create(taxa)
      .then(taxaCriada => addFeeStructure(db)(taxaCriada, json, usuario));

    return action;
  };

  return validateFee(taxa)
    .then(() => checkIfOverlaps(taxa))
    .then(() => createTaxa())
    .then(fee => fee);
};

export default addFee;
