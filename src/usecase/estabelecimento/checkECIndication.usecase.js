module.exports = db => (participanteFornecedorId, documento) => {
  function findIndicacao() {
    return db.entities.participanteIndicacao.findOne({
      attributes: ['nome'],
      where: {
        participanteId: participanteFornecedorId,
        documento,
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
