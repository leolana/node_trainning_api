import credenciamentoStatusEnum from '../../entities/credenciamentoStatusEnum';

const allowedStatus = {
  [credenciamentoStatusEnum.emAnalise]: [credenciamentoStatusEnum.pendente],
  [credenciamentoStatusEnum.reprovado]: [credenciamentoStatusEnum.emAnalise]

};

const changeStatus = db => (id, user, status) => {
  const find = () => db.entities.credenciamento.findOne({
    where: { id },
  });

  const validate = (credenciamento) => {
    if (!credenciamento) throw new Error('registro-nao-encontrado');

    const checkStatus = allowedStatus[status];

    if (!checkStatus.includes(credenciamento.status)) {
      throw new Error('credenciamento-status-invalido');
    }

    return credenciamento;
  };

  const persist = () => db.entities.credenciamentoAprovacao.create({
    status,
    credenciamentoId: id,
    usuario: user,
    observacao: '',
  });

  const save = (credenciamento) => {
    credenciamento.status = status;

    return Promise.all([
      credenciamento.save(),
      persist(),
    ]);
  };

  return find()
    .then(validate)
    .then(save);
};

export default changeStatus;
