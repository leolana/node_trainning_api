import rateTypeEnum from './rateTypeEnum';

const formatTax = (taxas, user) => {
  let newTax: any = taxas;
  newTax.antecipacao = [newTax.antecipacao];

  Object.keys(newTax).forEach((tipo) => {
    newTax[tipo].forEach((taxa) => {
      taxa.valorInicio = taxa.valorInicio;
      taxa.valorFim = taxa.valorFim;
      taxa.participanteTaxaTipo = rateTypeEnum[tipo];
      taxa.usuarioCriacao = user;
    });
  });

  newTax.cessao = newTax.cessao.filter(t => !t.participanteTaxaId);

  if (newTax.antecipacao[0].id) {
    delete newTax.antecipacao;
    newTax = newTax.cessao;
  } else {
    newTax = newTax.cessao.concat(newTax.antecipacao);
  }
  delete newTax.cessao;

  return newTax;
};

export default formatTax;
