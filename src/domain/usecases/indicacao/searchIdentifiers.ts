const searchIdentifiers = db => (supplierDocument, establishmentDocument) => {
  const findSupplier = document => (db.models as any).Participante
    .findOne({
      where: {
        documento: document,
      },
      attributes: ['id'],
    })
    .then((supplier) => {
      if (!supplier) throw new Error('fornecedor-nao-encontrado');

      return supplier;
    });

  const findEstablishment = document => (db.models as any).Participante
    .findOne({
      where: {
        documento: document,
      },
      attributes: ['id'],
    }).then((establishment) => {
      if (!establishment) throw new Error('estabelecimento-nao-encontrado');

      return establishment;
    });

  const findLink = (
    supplierId, establishmentId
  ) => (db.models as any).ParticipanteVinculo
    .findOne({
      where: {
        participanteEstabelecimentoId: establishmentId,
        participanteFornecedorId: supplierId,
      },
      attributes: ['id'],
    }).then((link) => {
      if (!link) {
        throw new Error('vinculo-nao-encontrado');
      }

      return link;
    });

  return Promise.all([
    findSupplier(supplierDocument),
    findEstablishment(establishmentDocument),
  ])
    .then(results => (
      findLink(results[0].id, results[1].id)
        .then(link => ({
          vinculoId: link.id,
          fornecedorId: results[0].id,
          estabelecimentoId: results[1].id,
        }))
    ));
};

export default searchIdentifiers;
