import participateNominationSourceEnum from '../../entities/participateNominationSourceEnum';

const updateIndicationEstablishmentUseCase = db => (
  indicacaoId, participanteId,
  documento, nome, email, telefone,
  usuario
) => db
  .entities.participanteIndicacao
  .findOne({
    where: {
      participanteId,
      id: indicacaoId,
      canalEntrada: participateNominationSourceEnum.indicacaoPorFornecedor,
    },
  })
  .then((indicacao) => {
    if (!indicacao) {
      throw new Error('indicacao-not-found');
    }

    return indicacao.update({
      documento,
      nome,
      email,
      telefone,
      usuario,
    });
  });

export default updateIndicationEstablishmentUseCase;
