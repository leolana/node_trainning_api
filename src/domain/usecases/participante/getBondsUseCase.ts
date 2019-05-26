import participanteVinculoStatus from '../../entities/participanteVinculoStatus';
import { Sequelize } from 'sequelize-database';

const getBondsUseCase = (db: Sequelize) => async (
  identityName: string,
  solicitadoEstabelecimento: boolean,
  id: number,
  statusVinculo: participanteVinculoStatus
) => {
  const include = [];

  if (solicitadoEstabelecimento) {
    include.push({
      model: db.entities.participanteFornecedor,
      as: 'fornecedor',
      attributes: ['participanteId'],
      include: [{
        model: db.entities.participante,
        as: 'participante',
        attributes: ['id', 'nome', 'documento'],
      }],
    });
  } else {
    include.push({
      model: db.entities.participanteEstabelecimento,
      as: 'estabelecimento',
      attributes: ['participanteId'],
      include: [{
        model: db.entities.participante,
        as: 'participante',
        attributes: ['id', 'nome', 'documento'],
      }],
    });
  }

  if (statusVinculo === participanteVinculoStatus.reprovado) {
    include.push({
      as: 'recusa',
      model: db.entities.motivoTipoRecusa,
      include: [{
        model: db.entities.motivoRecusa,
        as: 'motivoRecusa',
        attributes: ['id', 'descricao', 'requerObservacao'],
        where: { ativo: true },
        required: false,
      }],
      required: false,
    });
  }

  const participante = await db.entities[identityName].findOne({
    where: { participanteId: id },
    include: [{
      include,
      model: db.entities.participanteVinculo,
      as: 'vinculos',
      attributes: [
        'id',
        'usuario',
        'status',
        'exibeValorDisponivel',
        'diasAprovacao',
        'createdAt',
        'valorMaximoExibicao',
        'dataRespostaEstabelecimento',
        'motivoRecusaObservacao'
      ],
      where: { status: statusVinculo }
    }],
  });

  if (!participante) {
    return [];
  }

  participante.vinculos.forEach((v) => {
    if (v.recusa && v.recusa.motivoRecusa) {
      v.motivoRecusa = v.recusa.motivoRecusa.requerObservacao
        ? v.motivoRecusaObservacao : v.recusa.motivoRecusa.descricao;
    } else v.motivoRecusa = '';
  });

  return participante.vinculos.map(vinculo => ({
    id: vinculo.id,
    participante: (vinculo.fornecedor || vinculo.estabelecimento)
      .dataValues.participante.dataValues,
    status: vinculo.status,
    exibeValorDisponivel: vinculo.exibeValorDisponivel,
    valorMaximoExibicao: vinculo.valorMaximoExibicao,
    diasAprovacao: vinculo.diasAprovacao,
    dataCadastro: vinculo.createdAt,
    motivoRecusa: vinculo.motivoRecusa,
    dataRecusa: vinculo.dataRespostaEstabelecimento
  }));
};

export default getBondsUseCase;
