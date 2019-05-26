const verifyUseCase = db => (participantId) => {
  const prevalidation = (id) => {
    if (!id) return Promise.resolve(false);

    return Promise.resolve(true);
  };

  const find = id => db.entities.participanteExportacao
    .findOne({
      where: {
        participanteId: id,
      },
      attributes: ['id'],
    });

  const verify = entity => entity != null;

  return prevalidation(participantId)
    .then(ok => (ok
      ? find(participantId)
        .then(verify)
      : ok));
};

export default verifyUseCase;
