module.exports = db => (supplierDocument) => {
  const find = supplierDocument => db.entities.participante
    .findOne({
      where: {
        documento: supplierDocument,
      },
    });

  const validateReturn = (participant) => {
    if (!participant) throw String('fornecedor-nao-encontrado');
    return {
      fornecedorId: participant.id,
    };
  };

  return find(supplierDocument)
    .then(validateReturn);
};
