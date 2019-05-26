import dataFaker from '../../dataFaker';

const taxaPrazoFactory = (factory) => {
  return factory.define('taxaPrazo', {
    prazo: dataFaker.integer(),
    coeficiente: dataFaker.floating({ fixed: 2 }),
    minimo: dataFaker.integer(),
    maximo: dataFaker.integer(),
    usuario: dataFaker.string({ length: 100 }),

  });
};

export default taxaPrazoFactory;
