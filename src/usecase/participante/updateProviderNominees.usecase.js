
module.exports = db => (indicacao, idEC) => {
  function findIndication() {
    return db.entities.participanteIndicacao
      .findAll({
        where: { id: indicacao.participanteIndicacaoId },
      });
  }

  function updateNominees(indication) {
    if (!indication) throw String('indication-not-found');
    return db.entities.participanteIndicacao.update(
      {
        nome: indicacao.nome,
        telefone: indicacao.telefone,
        email: indicacao.email,
      },
      {
        where: {
          id: indicacao.participanteIndicacaoId,
          participanteId: idEC,
        },
      },
    );
  }

  return findIndication()
    .then(updateNominees);
};
