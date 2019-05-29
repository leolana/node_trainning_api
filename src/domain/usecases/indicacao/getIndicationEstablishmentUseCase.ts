import participateNominationSourceEnum from '../../entities/participateNominationSourceEnum';

const getIndicationEstablishmentUseCase = db => (indicacaoId, participanteId) => db
  .entities.participanteIndicacao
  .findOne({
    where: {
      participanteId,
      id: indicacaoId,
      canalEntrada: participateNominationSourceEnum.indicacaoPorFornecedor,
    },
    attributes: ['documento', 'nome', 'email', 'telefone'],
  })
  .then((indicacao) => {
    if (!indicacao) {
      throw new Error('indicacao-not-found');
    }
    return indicacao;
  });

export default getIndicationEstablishmentUseCase;
