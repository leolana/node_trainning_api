import { ParticipanteNotFoundException } from '../../../interfaces/rest/exceptions/ApiExceptions';

const getProviderNomineesUseCase = db => async (idEstabelecimento) => {
  const data: any = {};
  const participanteEstabelecimento = await (db.models as any).participanteEstabelecimento
    .findOne({
      attributes: ['participanteId'],
      include: [{
        as: 'participante',
        model: (db.models as any).participante,
        attributes: ['id', 'documento', 'ativo'],
      }],
    });

  if (!participanteEstabelecimento) throw new ParticipanteNotFoundException();
  data.participante = participanteEstabelecimento.participante;

  const participanteIndicacao = await (db.models as any).participanteIndicacao.findAll({
    where: { participanteId: idEstabelecimento },
    include: [{
      model: (db.models as any).motivoTipoRecusa,
      include: [{
        model: (db.models as any).motivoRecusa,
        as: 'motivoRecusa',
        attributes: ['id', 'descricao', 'requerObservacao'],
        where: { ativo: true },
      }],
    }],
  });

  data.indicacoes = participanteIndicacao;

  data.indicacoes.forEach((indicacao) => {
    if (indicacao.motivoTipoRecusa
      && indicacao.motivoTipoRecusa.motivoRecusa
      && !indicacao.motivoTipoRecusa.motivoRecusa.requerObservacao) {
      indicacao.motivo = indicacao.motivoTipoRecusa.motivoRecusa.descricao;
    }
  });

  return data.indicacoes.map(indicacao => ({
    id: indicacao.id,
    dataCadastro: indicacao.createdAt,
    status: indicacao.status,
    documento: indicacao.documento,
    participante: {
      id: data.participante.id,
      documento: data.participante.documento,
    },
    contato: {
      nome: indicacao.nome,
      email: indicacao.email,
      telefone: indicacao.telefone,
    },
    motivoCancelamento: indicacao.motivo,
    dataCancelamento: (indicacao.motivoTipoRecusa && indicacao.motivoTipoRecusa.motivoRecusa)
      ? indicacao.dataFimIndicacao : null,
  }));

};

export default getProviderNomineesUseCase;
