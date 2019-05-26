/* eslint-disable max-len */
const credenciamentoStatus = require('../../service/credenciamento/accreditationStatus.enum');
const checkDocumentExistence = require('./checkDocumentExistence.usecase');
const documentStatus = require('./checkDocumentExistenceStatus.enum');

module.exports = db => (credenciamentoId) => {
  function get() {
    return db.entities.credenciamento.findOne({
      where: {
        id: credenciamentoId,
        status: credenciamentoStatus.pendente,
      },
      attributes: ['documento'],
    }).then((credenciamento) => {
      if (!credenciamento) {
        throw String('credenciamento-nao-localizado');
      }
      return credenciamento.documento;
    });
  }

  function validate(document) {
    return checkDocumentExistence(db)(document).then((arr) => {
      const blockIfExists = {
        [documentStatus.credenciamentoEmAnalise]: 0,
      };
      const blocked = arr.find(x => x.statusDocumento in blockIfExists);

      if (blocked) {
        throw String(`status-documento-${blocked.statusDocumento}`);
      }

      return true;
    });
  }

  return get().then(validate);
};
