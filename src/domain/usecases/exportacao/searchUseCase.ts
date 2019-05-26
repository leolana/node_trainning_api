const searchUseCase = db => (participantId) => {
  const list = id => db.entities.exportacao
    .findAll({
      attributes: ['id', 'titulo', 'descricao'],
      include: [
        {
          model: db.entities.participanteExportacao,
          as: 'participante',
          attributes: [],
          where: {
            participanteId: id,
          },
          required: true,
        },
      ],
    });

  return list(participantId);
};

export default searchUseCase;
