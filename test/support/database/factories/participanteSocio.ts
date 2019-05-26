import dataFaker from '../../dataFaker';

const participanteSocioFactory = (factory) => {
  return factory.define('participanteSocio', {
    participanteId: dataFaker.integer(),
    tipoPessoa: dataFaker.integer({ min: 1, max: 2 }),
    documento: dataFaker.string({ length: 14, pool: '0123456789' }),
    nome: dataFaker.name(),
    aberturaNascimento: dataFaker.date(),
    email: dataFaker.email(),
    telefone: dataFaker.string({ length: 10, pool: '0123456798' }),
    participacao: dataFaker.floating({ min: 0, max: 100, fixed: 2 }),
    celular: dataFaker.string({ length: 11, pool: '0123456798' }),
    contato: dataFaker.bool({ likelihood: 100 }),
    razaoSocial: dataFaker.name(),
    inscricaoEstadual: dataFaker.string({ length: 6, pool: '0123456789' }),
    inscricaoMunicipal: dataFaker.string({ length: 6, pool: '0123456789' }),
  });
};

export default participanteSocioFactory;
