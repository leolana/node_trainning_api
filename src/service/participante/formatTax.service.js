const tipoTaxas = require('../../service/participante/rateType.enum');

module.exports = (taxas, user) => {
  taxas.antecipacao = [taxas.antecipacao];

  Object.keys(taxas).forEach((tipo) => {
    taxas[tipo].forEach((taxa) => {
      taxa.valorInicio = taxa.valorInicio;
      taxa.valorFim = taxa.valorFim;
      taxa.participanteTaxaTipo = tipoTaxas[tipo];
      taxa.usuarioCriacao = user;
    });
  });

  taxas.cessao = taxas.cessao.filter(t => !t.participanteTaxaId);

  if (taxas.antecipacao[0].id) {
    delete taxas.antecipacao;
    taxas = taxas.cessao;
  } else {
    taxas = taxas.cessao.concat(taxas.antecipacao);
  }
  delete taxas.cessao;

  return taxas;
};
