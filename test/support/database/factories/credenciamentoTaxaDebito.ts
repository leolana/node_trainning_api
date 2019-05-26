import dataFaker from '../../dataFaker';

const credenciamentoTaxaDebitoFactory = (factory) => {
  return factory.define('credenciamentoTaxaDebito', {
    valor: dataFaker.floating({ fixed: 2 })
  });
};

export default credenciamentoTaxaDebitoFactory;
