import dataFaker from '../../dataFaker';

const credenciamentoCapturaFactory = (factory) => {
  return factory.define('credenciamentoCaptura', {
    credenciamentoId: dataFaker.integer(),
    capturaId: dataFaker.integer(),
    quantidade: dataFaker.integer(),
    valor: dataFaker.floating({ fixed: 2 }),
  });
};

export default credenciamentoCapturaFactory;
