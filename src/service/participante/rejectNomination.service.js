const status = require('../../service/participante/nominationStatus.enum');

module.exports = db => (id, reasonId, reason, user) => {
  const find = id => db.entities.participanteIndicacao.findOne({
    attributes: ['status'],
    where: {
      id,
    },
  });

  const validate = (nomination) => {
    if (!nomination) throw String('indicacao-not-found');

    if (nomination.status !== status.pendente) {
      throw String('indicacao-status-invalido');
    }
  };

  const reject = (id, reasonId, reason, user) => db.entities
    .participanteIndicacao.update(
      {
        status: status.reprovado,
        motivo: reason,
        motivoTipoRecusaId: reasonId,
        usuarioResposta: user,
        dataFimIndicacao: new Date(),
      },
      {
        where: {
          id,
        },
      }
    );

  return find(id)
    .then(validate)
    .then(() => reject(id, reasonId, reason, user));
};
