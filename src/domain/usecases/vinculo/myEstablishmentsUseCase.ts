const myEstablishmentsUseCase = db => idFornecedor => (db.models as any).ParticipanteVinculo
  .findAll({
    where: {
      participanteFornecedorId: idFornecedor,
    },
    attributes: ['id', 'status'],
    include: [{
      model: (db.models as any).ParticipanteEstabelecimento,
      as: 'estabelecimento',
      attributes: ['participanteId'],
      include: [{
        model: (db.models as any).Participante,
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
