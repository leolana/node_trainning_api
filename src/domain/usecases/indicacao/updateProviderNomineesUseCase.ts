
const updateProviderNomineesUseCase = db => (indicacao, idEC) => {
  const findIndication = () => {
    return db.entities.participanteIndicacao
      .findAll({
        where: { id: indicacao.participanteIndicacaoId },
      });
  };

  const updateNominees = (indication) => {
    if (!indication) throw new Error('indication-not-found');
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
  };

  return findIndication()
    .then(updateNominees);
};

export default updateProviderNomineesUseCase;
