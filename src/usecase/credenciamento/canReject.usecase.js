/* eslint-disable max-len */
const credenciamentoStatus = require('../../service/credenciamento/accreditationStatus.enum');

module.exports = db => (credenciamentoId) => {
  function validate() {
    return db.entities.credenciamento.count({
      where: {
        id: credenciamentoId,
        status: credenciamentoStatus.emAnalise,
      },
    }).then((credenciamento) => {
      if (!credenciamento) {
        throw String('credenciamento-nao-localizado');
      }
      return true;
    });
  }

  return validate();
};
