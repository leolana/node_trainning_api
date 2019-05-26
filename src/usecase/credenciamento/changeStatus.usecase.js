// eslint-disable-next-line max-len
const credenciamentoStatus = require('../../service/credenciamento/accreditationStatus.enum');

const allowedStatus = {};
allowedStatus[credenciamentoStatus.emAnalise] = [
  credenciamentoStatus.pendente,
];
allowedStatus[credenciamentoStatus.reprovado] = [
  credenciamentoStatus.emAnalise,
];

module.exports = db => (id, user, status) => {
  const find = () => db.entities.credenciamento.findOne({
    where: { id },
  });

  const validate = (credenciamento) => {
    if (!credenciamento) throw String('registro-nao-encontrado');

    const checkStatus = allowedStatus[status];

    if (!checkStatus.includes(credenciamento.status)) {
      throw String('credenciamento-status-invalido');
    }

    return credenciamento;
  };

  const persist = () => db.entities.credenciamentoAprovacao.create({
    credenciamentoId: id,
    status,
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
