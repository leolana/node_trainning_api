import dataFaker from '../../dataFaker';

const taxaFactory = (factory) => {
  return factory.define('taxa', {
    tipoPessoa: dataFaker.integer(),
    inicio: dataFaker.date(),
    fim: dataFaker.date(),
    default: dataFaker.bool(),
    usuario: dataFaker.string({ length: 100 }),

  });
};

export default taxaFactory;
