import dataFaker from '../../dataFaker';

const taxaContratualFactory = (factory) => {
  return factory.define('taxaContratual', {
    tipoPessoa: dataFaker.integer(),
    inicio: dataFaker.date(),
    fim: dataFaker.date(),
    antecipacao: dataFaker.floating({ fixed: 2 }),
    adesao: dataFaker.floating({ fixed: 2 }),
    maximoParcelas: dataFaker.integer(),
    usuario: dataFaker.string({ length: 100 }),

  });
};

export default taxaContratualFactory;
