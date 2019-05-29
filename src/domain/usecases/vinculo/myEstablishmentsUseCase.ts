const myEstablishmentsUseCase = db => idFornecedor => (db.models as any).participanteVinculo
  .findAll({
    where: {
      participanteFornecedorId: idFornecedor,
    },
    attributes: ['id', 'status'],
    include: [{
      model: (db.models as any).participanteEstabelecimento,
      as: 'estabelecimento',
      attributes: ['participanteId'],
      include: [{
        model: (db.models as any).participante,
        as: 'participante',
        attributes: ['id', 'nome', 'documento', 'razaoSocial', 'telefone'],
      }],
    }],
  })
  .then(links => links.map(v => ({
    ...v.estabelecimento.participante.dataValues,
    status: v.status
  })));

export default myEstablishmentsUseCase;
