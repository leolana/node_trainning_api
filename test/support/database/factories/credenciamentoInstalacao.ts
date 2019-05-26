import dataFaker from '../../dataFaker';

const credenciamentoInstalacaoFactory = (factory) => {
  return factory.define('credenciamentoInstalacao', {
    credenciamentoId: dataFaker.integer(),
    cep: dataFaker.string({ length: 8 }),
    logradouro: dataFaker.string({ length: 200 }),
    numero: dataFaker.string({ length: 15 }),
    complemento: dataFaker.string({ length: 50 }),
    bairro: dataFaker.string({ length: 100 }),
    cidadeId: dataFaker.integer(),
    pontoReferencia: dataFaker.string({ length: 100 }),
    dias: dataFaker.integer(),
    horario: dataFaker.integer(),
    nome: dataFaker.name(),
    email: dataFaker.email(),
    telefone: dataFaker.string({ length: 10 }),
    celular: dataFaker.string({ length: 11 }),

  });
};

export default credenciamentoInstalacaoFactory;
