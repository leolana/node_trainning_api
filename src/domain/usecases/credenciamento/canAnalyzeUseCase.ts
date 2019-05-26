import credenciamentoStatusEnum from '../../entities/credenciamentoStatusEnum';
import checkDocumentExistenceUseCase from './checkDocumentExistenceUseCase';
import { checkDocumentExistenceStatusEnum } from './checkDocumentExistenceStatusEnum';

const canAnalyzeUseCase = db => (credenciamentoId) => {
  function get() {
    return db.entities.credenciamento.findOne({
      where: {
        id: credenciamentoId,
        status: credenciamentoStatusEnum.pendente,
      },
      attributes: ['documento'],
    }).then((credenciamento) => {
      if (!credenciamento) {
        throw new Error('credenciamento-nao-localizado');
      }
      return credenciamento.documento;
    });
  }

  function validate(document) {
    return checkDocumentExistenceUseCase(db)(document).then((arr) => {
      const blockIfExists = {
        [checkDocumentExistenceStatusEnum.credenciamentoEmAnalise]: 0,
      };
      const blocked = arr.find(x => x.statusDocumento in blockIfExists);

      if (blocked) {
        throw new Error(`status-documento-${blocked.statusDocumento}`);
      }

      return true;
    });
  }

  return get().then(validate);
};

export default canAnalyzeUseCase;
