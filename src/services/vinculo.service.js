const findById = require('../service/vinculo/findById.util');
const findByPartIds = require('../service/vinculo/findByParticipantsIds.utils');

function service(db, siscofWrapper) {
  this.obterVinculoPorId = findById(db, siscofWrapper);
  this.obterVinculoPorIdParticipantes = findByPartIds(db, siscofWrapper);

  return Promise.resolve(this);
}

module.exports = di => {
  di.provide('$vinculo-service', '$main-db', '$siscof-wrapper', service);
};
