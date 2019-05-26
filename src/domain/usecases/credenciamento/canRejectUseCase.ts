import credenciamentoStatusEnum from '../../entities/credenciamentoStatusEnum';

const canRejectUseCase = db => (credenciamentoId) => {
  function validate() {
    return db.entities.credenciamento.count({
      where: {
        id: credenciamentoId,
        status: credenciamentoStatusEnum.emAnalise,
      },
    }).then((credenciamento) => {
      if (!credenciamento) {
        throw new Error('credenciamento-nao-localizado');
      }
      return true;
    });
  }

  return validate();
};

export default canRejectUseCase;
