import dataFaker from '../../dataFaker';

const credenciamentoContatoFactory = (factory) => {
  return factory.define('credenciamentoContato', {
    credenciamentoId: dataFaker.integer(),
    nome: dataFaker.name(),
    email: dataFaker.email(),
    telefone: dataFaker.string({ length: 10 }),
    celular: dataFaker.string({ length: 11 }),
  });
};

export default credenciamentoContatoFactory;
