import dataFaker from '../../dataFaker';

const credenciamentoAprovacaoFactory = (factory) => {
  return factory.define('credenciamentoAprovacao', {
    credenciamentoId: dataFaker.integer(),
    status: dataFaker.integer(),
    usuario: dataFaker.string({ length: 100 }),
    observacao: dataFaker.string({ length: 100 }),

  });
};

export default credenciamentoAprovacaoFactory;
