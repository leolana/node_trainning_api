import { Sequelize } from 'sequelize-typescript';
import { BondNotFoundException } from '../../../interfaces/rest/exceptions/ApiExceptions';
import participanteVinculoStatus from '../../entities/participanteVinculoStatus';
import { DateTime } from 'luxon';
import { SiscofWrapper } from '../../../infra/siscof';

const getProviderBondsUseCase = (db: Sequelize, siscofWrapper: SiscofWrapper) => async (
  id: number,
  estabelecimentoId: number,
  novoStatus: number,
  email: string,
  motivoTipoRecusaId?: number,
  observacao?: string) => {

  const vinculo = await (db.models as any).ParticipanteVinculo.findOne({
    where:
    {
      id,
      participanteEstabelecimentoId: estabelecimentoId,
    },
  });

  if (!vinculo) {
    throw new BondNotFoundException();
  }

  await siscofWrapper.incluirExcluirCessionarioEC(
    vinculo.participanteFornecedorId,
    vinculo.participanteEstabelecimentoId,
    novoStatus
  );

  vinculo.status = novoStatus;

  if (novoStatus !== participanteVinculoStatus.pendente) {
    vinculo.dataRespostaEstabelecimento = DateTime.local().toUTC().toSQL();
    vinculo.usuarioRespostaEstabelecimento = email;
  }

  if (novoStatus === participanteVinculoStatus.cancelado
    || novoStatus === participanteVinculoStatus.reprovado) {
    vinculo.motivoTipoRecusaId = motivoTipoRecusaId;
    vinculo.motivoRecusaObservacao = observacao;
  }

  await Promise.all([
    vinculo.save(),
    (db.models as any).ParticipanteVinculoHistorico.create({
      participanteEstabelecimentoId: vinculo.participanteEstabelecimentoId,
      participanteFornecedorId: vinculo.participanteFornecedorId,
      status: vinculo.status,
      exibeValorDisponivel: vinculo.exibeValorDisponivel,
      diasAprovacao: vinculo.diasAprovacao,
      dataRespostaEstabelecimento: vinculo.dataRespostaEstabelecimento,
      usuarioRespostaEstabelecimento: vinculo.usuarioRespostaEstabelecimento,
    }),
  ]);

  return vinculo;
};

export default getProviderBondsUseCase;
