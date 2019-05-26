import dataFaker from '../../dataFaker';

const credenciamentoSocioFactory = (factory) => {
  return factory.define('credenciamentoSocio', {
    credenciamentoId: dataFaker.integer(),
    tipoPessoa: dataFaker.integer(),
    documento: dataFaker.string({ length: 18 }),
    nome: dataFaker.string({ length: 100 }),
    aberturaNascimento: dataFaker.date(),
    email: dataFaker.string({ length: 200 }),
    telefone: dataFaker.string({ length: 10 }),
    participacao: dataFaker.floating({ min: 1, max: 100, fixed: 2 }),
    celular: dataFaker.string({ length: 11 }),
    contato: dataFaker.bool(),
    razaoSocial: dataFaker.string({ length: 100 }),
    inscricaoEstadual: dataFaker.string({ length: 50 }),
    inscricaoMunicipal: dataFaker.string({ length: 50 }),
  });
};

export default credenciamentoSocioFactory;
