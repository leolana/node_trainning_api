// eslint-disable-next-line max-len
const indicacaoStatus = require('../service/participante/nominationStatus.enum');

module.exports = (di) => {
  di.provide(
    '@@participante-indicacao-status',
    () => Promise.resolve(indicacaoStatus)
  );
};
