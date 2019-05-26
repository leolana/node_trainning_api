const checkECIndicationUseCase = db => (participanteFornecedorId, documento) => {
  function findIndicacao() {
    return db.entities.participanteIndicacao.findOne({
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
    return db.entities.participanteEstabelecimento.findOne({
      include: [{
        model: db.entities.participante,
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
