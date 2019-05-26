module.exports = db => (participantId) => {
  const prevalidation = (participantId) => {
    if (!participantId) return Promise.resolve(false);

    return Promise.resolve(true);
  };

  const find = participantId => db.entities.participanteExportacao
    .findOne({
      where: {
        participanteId: participantId,
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
