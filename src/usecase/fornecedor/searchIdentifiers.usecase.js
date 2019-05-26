module.exports = db => (supplierDocument, establishmentDocument) => {
  const findSupplier = supplierDocument => db.entities.participante
    .findOne({
      where: {
        documento: supplierDocument,
      },
      attributes: ['id'],
    })
    .then((supplier) => {
      if (!supplier) throw String('fornecedor-nao-encontrado');

      return supplier;
    });

  const findEstablishment = establishmentDocument => db.entities.participante
    .findOne({
      where: {
        documento: establishmentDocument,
      },
      attributes: ['id'],
    }).then((establishment) => {
      if (!establishment) throw String('estabelecimento-nao-encontrado');

      return establishment;
    });

  const findLink = (
    supplierId, establishmentId
  ) => db.entities.participanteVinculo
    .findOne({
      where: {
        participanteEstabelecimentoId: establishmentId,
        participanteFornecedorId: supplierId,
      },
      attributes: ['id'],
    }).then((link) => {
      if (!link) {
        throw String('vinculo-nao-encontrado');
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
