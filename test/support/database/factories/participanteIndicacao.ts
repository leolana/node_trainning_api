import dataFaker from '../../dataFaker';

const participanteIndicacaoFactory = (factory) => {
  return factory.define('participanteIndicacao', {
    participanteId: dataFaker.integer(),
    tipoPessoa: dataFaker.integer({ min: 1, max: 2 }),
    documento: dataFaker.string({ length: 18, pool: '0123456798' }),
    nome: dataFaker.name(),
    email: dataFaker.email(),
    telefone: dataFaker.string({ length: 11, poll: '0123456789' }),
    canalEntrada: dataFaker.integer({ min: 1, max: 2 }),
    usuario: dataFaker.name(),
    status: dataFaker.integer({ min: 1, max: 3 }),
    usuarioResposta: dataFaker.sentence({ words: 5 }),
    motivo: dataFaker.sentence({ words: 10 }),
    motivoTipoRecusaId: dataFaker.integer(),
    dataFimIndicacao: dataFaker.date(),
  });
};

export default participanteIndicacaoFactory;
