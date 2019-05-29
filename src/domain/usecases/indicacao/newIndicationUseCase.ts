const newIndicationUseCase = db => (
  participanteFornecedorId,
  documento,
  nome,
  email,
  telefone,
  usuario,
  tipoPessoa,
  canalEntrada,
  status
) => {
  const check = () => {
    return (db.models as any).ParticipanteIndicacao
      .count({
        where: {
          documento,
          participanteId: participanteFornecedorId
        }
      })
      .then((jaIndicado) => {
        if (jaIndicado) {
          throw new Error('estabelecimento-ja-indicado');
        }
      });
  };

  const create = () => {
    return (db.models as any).ParticipanteIndicacao.create({
      documento,
      nome,
      email,
      telefone,
      usuario,
      tipoPessoa,
      canalEntrada,
      status,
      participanteId: participanteFornecedorId
    });
  };

  return check()
    .then(create);
};

export default newIndicationUseCase;
