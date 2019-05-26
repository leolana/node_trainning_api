const vinculoStatus = require('../service/vinculo/status.enum');

module.exports = (di) => {
  di.provide(
    '@@participante-vinculo-status',
    () => Promise.resolve(vinculoStatus)
  );
};
