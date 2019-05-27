import participanteIndicacaoStatus from '../../entities/participanteIndicacaoStatus';

const rejectNominationService = db => (participanteId, motivoTipoRecusaId, motivo, usuario) => {
  const find = id => db.entities.participanteIndicacao.findOne({
    attributes: ['status'],
    where: {
      id,
    },
  });

  const validate = (nomination) => {
    if (!nomination) throw new Error('indicacao-not-found');

    if (nomination.status !== participanteIndicacaoStatus.pendente) {
      throw new Error('indicacao-status-invalido');
    }
  };

  const reject = (id, reasonId, reason, user) => db.entities
    .participanteIndicacao.update(
    {
      status: participanteIndicacaoStatus.reprovado,
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

  return find(participanteId)
    .then(validate)
    .then(() => reject(participanteId, motivoTipoRecusaId, motivo, usuario));
};

export default rejectNominationService;
