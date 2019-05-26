
const getIdFromDocument = db => (documento) => {
  const find = () => db.entities.credenciamento.findOne({
    where: { documento },
  });

  const validate = (credenciamento) => {
    if (!credenciamento) throw new Error('registro-nao-encontrado');

    return credenciamento;
  };

  return find()
    .then(validate);
};

export default getIdFromDocument;
