const checkECIndicationUseCase = db => (participanteFornecedorId, documento) => {
  function findIndicacao() {
    return (db.models as any).ParticipanteIndicacao.findOne({
      attributes: ['nome'],
      where: {
        documento,
        participanteId: participanteFornecedorId,
      },
    }).then((indication) => {
      if (indication) {
        indication.dataValues.jaFoiIndicado = true;
        return indication.dataValues;
      }
      return {};
    });
  }

  function findEstabelecimento() {
    return (db.models as any).ParticipanteEstabelecimento.findOne({
      include: [{
        model: (db.models as any).Participante,
        as: 'participante',
        attributes: ['id', 'nome', 'documento'],
        where: { documento },
      }],
    }).then((establishment) => {
      if (establishment) {
        return establishment.participante.dataValues;
      }
      return findIndicacao();
    });
  }

  return findEstabelecimento();
};

export default checkECIndicationUseCase;
