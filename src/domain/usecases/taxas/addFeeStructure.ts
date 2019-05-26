import addFeeFlags from './addFeeFlags';
import eventosEnum from '../../services/eventos/eventosEnum';

const addFeeStructure = db => (taxa, json, usuario) => {
  const creates = [];

  creates.push(addFeeFlags(db)(taxa.id, json.bandeiras, usuario));

  const createsTaxasPrazosRanges = {};
  const keyPrazoRange = (prazo, range) => {
    const key = `${prazo.prazo}-${range.minimo}-${range.maximo}`;
    return key;
  };

  json.prazos.forEach((prazo) => {
    json.prazos33[0].ranges.forEach((range) => {
      const createTaxaPrazoRange = db.entities.taxaPrazo.create({
        usuario,
        prazo: prazo.prazo,
        coeficiente: prazo.coeficiente,
        minimo: range.minimo,
        maximo: range.maximo,
        taxaId: taxa.id,
        eventoId: eventosEnum[range.maximo],
      });

      const key = keyPrazoRange(prazo, range);
      createsTaxasPrazosRanges[key] = createTaxaPrazoRange;

      creates.push(createTaxaPrazoRange);
    });
  });

  const addTaxaAdministrativa = (prazo, bandeira, range) => {
    const key = keyPrazoRange(prazo, range);
    const createTaxaPrazoRange = createsTaxasPrazosRanges[key];

    const createTaxaAdministrativa = createTaxaPrazoRange.then((taxaPrazo) => {
      const action = db.entities.taxaAdministrativa.create({
        usuario,
        valorBase: range.taxa,
        bandeiraId: bandeira.idBandeira,
        taxaPrazoId: taxaPrazo.id,
      });
      return action;
    });

    creates.push(createTaxaAdministrativa);
  };

  json.prazos.forEach((prazo) => {
    json.prazos33.forEach((bandeira) => {
      bandeira.ranges.forEach((range) => {
        addTaxaAdministrativa(prazo, bandeira, range);
      });
    });
  });

  return Promise.all(creates).then(() => taxa);
};

export default addFeeStructure;
