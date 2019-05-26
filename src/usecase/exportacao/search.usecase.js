module.exports = db => (participantId) => {
  const list = participantId => db.entities.exportacao
    .findAll({
      attributes: ['id', 'titulo', 'descricao'],
      include: [
        {
          model: db.entities.participanteExportacao,
          as: 'participante',
          attributes: [],
          where: {
            participanteId: participantId,
          },
          required: true,
        },
      ],
    });

  return list(participantId);
};
