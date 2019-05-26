import dataFaker from '../../dataFaker';

const capturaFactory = (factory) => {
  return factory.define('captura', {
    produtoId: dataFaker.integer(),
    inicio: dataFaker.date(),
    fim: dataFaker.date(),
    tipoCaptura: dataFaker.integer(),
    valor: dataFaker.floating({ min: 0, max: 100, fixed: 2 }),
    usuario: dataFaker.string({ length: 100 }),
  });
};

export default capturaFactory;
