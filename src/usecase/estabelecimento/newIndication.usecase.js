module.exports = db => (
  participanteFornecedorId,
  documento,
  nome,
  email,
  telefone,
  usuario,
  tipoPessoa,
  canalEntrada,
  status,
) => {
  function check() {
    return db.entities.participanteIndicacao.count({
      where: {
        participanteId: participanteFornecedorId,
        documento,
      },
    }).then((jaIndicado) => {
      if (jaIndicado) {
        throw String('estabelecimento-ja-indicado');
      }
    });
  }

  function create() {
    return db.entities.participanteIndicacao.create({
      participanteId: participanteFornecedorId,
      documento,
      nome,
      email,
      telefone,
      usuario,
      tipoPessoa,
      canalEntrada,
      status,
    });
  }

  return check().then(create);
};
