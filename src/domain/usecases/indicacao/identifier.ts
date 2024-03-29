const identifier = db => (supplierDocument) => {
  const find = document => (db.models as any).Participante
    .findOne({
      where: {
        documento: document,
      },
    });

  const validateReturn = (participant) => {
    if (!participant) throw new Error('fornecedor-nao-encontrado');
    return {
      fornecedorId: participant.id,
    };
  };

  return find(supplierDocument)
    .then(validateReturn);
};

export default identifier;
