const findAvailableValue = require('./findAvailableValue.util');

module.exports = (db, siscofWrapper) => (vinculoId, include = []) => {
  function get() {
    return db.entities.participanteVinculo.findOne({
      where: { id: vinculoId },
      include,
    });
  }

  function assert(vinculo) {
    if (!vinculo) {
      throw String('vinculo-nao-encontrado');
    }
    return vinculo;
  }

  return get()
    .then(assert)
    .then(findAvailableValue(siscofWrapper));
};
