module.exports = db => idFornecedor => db.entities.participanteVinculo
  .findAll({
    where: {
      participanteFornecedorId: idFornecedor,
    },
    attributes: ['id', 'status'],
    include: [{
      model: db.entities.participanteEstabelecimento,
      as: 'estabelecimento',
      attributes: ['participanteId'],
      include: [{
        model: db.entities.participante,
        as: 'participante',
        attributes: ['id', 'nome', 'documento', 'razaoSocial', 'telefone'],
      }],
    }],
  })
  .then(links => links.map(v => ({
    ...v.estabelecimento.participante.dataValues,
    status: v.status,
  })));
