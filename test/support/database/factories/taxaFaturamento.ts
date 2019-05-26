import dataFaker from '../../dataFaker';

const taxaFaturamentoFactory = (factory) => {
  return factory.define('taxaFaturamento', {
    coeficiente: dataFaker.floating({ fixed: 2 }),
    usuario: dataFaker.string({ length: 100 }),

  });
};

export default taxaFaturamentoFactory;
