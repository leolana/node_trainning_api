const addTaxasBandeiras = require('./addFeeFlags.usecase');
const eventos = require('../../service/eventos/eventos.enum');

module.exports = db => (taxa, json, usuario) => {
  const creates = [];

  creates.push(addTaxasBandeiras(db)(taxa.id, json.bandeiras, usuario));

  const createsTaxasPrazosRanges = {};
  const keyPrazoRange = (prazo, range) => {
    const key = `${prazo.prazo}-${range.minimo}-${range.maximo}`;
    return key;
  };

  json.prazos.forEach(_prazo => {
    json.prazos33[0].ranges.forEach(_range => {
      const createTaxaPrazoRange = db.entities.taxaPrazo.create({
        prazo: _prazo.prazo,
        coeficiente: _prazo.coeficiente,
        minimo: _range.minimo,
        maximo: _range.maximo,
        taxaId: taxa.id,
        eventoId: eventos[_range.maximo],
        usuario,
      });

      const key = keyPrazoRange(_prazo, _range);
      createsTaxasPrazosRanges[key] = createTaxaPrazoRange;

      creates.push(createTaxaPrazoRange);
    });
  });

  const addTaxaAdministrativa = (_prazo, _bandeira, _range) => {
    const key = keyPrazoRange(_prazo, _range);
    const createTaxaPrazoRange = createsTaxasPrazosRanges[key];

    const createTaxaAdministrativa = createTaxaPrazoRange.then(taxaPrazo => {
      const action = db.entities.taxaAdministrativa.create({
        valorBase: _range.taxa,
        bandeiraId: _bandeira.idBandeira,
        taxaPrazoId: taxaPrazo.id,
        usuario,
      });
      return action;
    });

    creates.push(createTaxaAdministrativa);
  };

  json.prazos.forEach(_prazo => {
    json.prazos33.forEach(_bandeira => {
      _bandeira.ranges.forEach(_range => {
        addTaxaAdministrativa(_prazo, _bandeira, _range);
      });
    });
  });

  return Promise.all(creates).then(() => taxa);
};
