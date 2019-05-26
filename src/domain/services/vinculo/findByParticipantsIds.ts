import findAvailableValue from './findAvailableValue';

const findByParticipantsIds = (db, siscofWrapper) => (
  estabelecimentoId,
  fornecedorId,
  include = [],
) => {
  function get() {
    return db.entities.participanteVinculo.findOne({
      include,
      where: {
        participanteEstabelecimentoId: estabelecimentoId,
        participanteFornecedorId: fornecedorId,
      },
    });
  }

  function assert(vinculo) {
    if (!vinculo) {
      throw new Error('vinculo-nao-encontrado');
    }
    return vinculo;
  }

  return get()
    .then(assert)
    .then(findAvailableValue(siscofWrapper));
};

export default findByParticipantsIds;
