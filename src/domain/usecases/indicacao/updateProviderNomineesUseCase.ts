
const updateProviderNomineesUseCase = db => (indicacao, idEC) => {
  const findIndication = () => {
    return (db.models as any).ParticipanteIndicacao
      .findAll({
        where: { id: indicacao.participanteIndicacaoId },
      });
  };

  const updateNominees = (indication) => {
    if (!indication) throw new Error('indication-not-found');
    return (db.models as any).ParticipanteIndicacao.update(
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
