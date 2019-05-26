// eslint-disable-next-line max-len
const credenciamentoStatus = require('../service/credenciamento/accreditationStatus.enum');

module.exports = (di) => {
  di.provide(
    '@@credenciamento-status',
    () => Promise.resolve(credenciamentoStatus)
  );
};
