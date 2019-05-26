import dataFaker from '../../dataFaker';

const credenciamentoDomicilioBancarioFactory = (factory) => {
  return factory.define('credenciamentoDomicilioBancario', {
    credenciamentoId: dataFaker.integer(),
    bandeiraId: dataFaker.integer(),
    bancoId: dataFaker.string({ length: 3 }),
    bancoNome: dataFaker.string({ length: 50 }),
    agencia: dataFaker.string({ length: 5 }),
    conta: dataFaker.string({ length: 10 }),
    digito: dataFaker.string({ length: 1 }),
  });
};

export default credenciamentoDomicilioBancarioFactory;
