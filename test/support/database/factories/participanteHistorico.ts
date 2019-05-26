import dataFaker from '../../dataFaker';

const participanteHistoricoFactory = (factory) => {
  return factory.define('participanteHistorico', {
    participanteId: dataFaker.integer(),
    tipoPessoa: dataFaker.integer({ min: 1, max: 2 }),
    ramoAtividadeCodigo: dataFaker.integer({ min: 1 }),
    documento: dataFaker.string({ length: 14, pool: '0123456789' }),
    nome: dataFaker.name(),
    aberturaNascimento: dataFaker.date(),
    telefone: dataFaker.string({ length: 10, pool: '0123456798' }),
    cep: dataFaker.string({ length: 8, poll: '0123456789' }),
    logradouro: dataFaker.name(),
    numero: dataFaker.string({ length: 10, poll: '0123456798' }),
    complemento: dataFaker.sentence({ words: 6 }),
    bairro: dataFaker.sentence({ words: 2 }),
    cidadeId: dataFaker.integer({ max: 10000 }),
    razaoSocial: dataFaker.name(),
    inscricaoEstadual: dataFaker.string({ length: 6, pool: '0123456789' }),
    inscricaoMunicipal: dataFaker.string({ length: 6, pool: '0123456789' }),
    ativo: dataFaker.bool({ likelihood: 100 }),
    usuario: dataFaker.name(),
    arquivos: dataFaker.string(),
  });
};

export default participanteHistoricoFactory;
