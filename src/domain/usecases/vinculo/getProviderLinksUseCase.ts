import { DateTime } from 'luxon';
import findAvailableValue from '../../services/vinculo/findAvailableValue';
import linkStatusEnum from '../../services/vinculo/linkStatusEnum';
const getProviderLinksUseCase = (db, siscofWrapper) => (
  fornecedorId,
  vinculoStatus,
  nome,
  documento,
  dataCadastroInicio,
  dataCadastroFim
) => {
  function getVinculos() {
    const whereParticipante: any = {
      ativo: true,
    };
    let dataInicio;
    let dataFim;
    if (nome) {
      whereParticipante.nome = { $iLike: `%${nome}%` };
    }
    if (documento) {
      whereParticipante.documento = { $like: `%${documento}%` };
    }

    if (dataCadastroInicio) {
      dataInicio = DateTime.fromJSDate(
        new Date(dataCadastroInicio)
      ).toSQLDate();
    }

    if (dataCadastroFim) {
      const date = DateTime.fromJSDate(
        new Date(dataCadastroFim)
      ).plus({ days: 1 });
      dataFim = date.toSQLDate();
    }

    const whereVinculo: any = {
      participanteFornecedorId: fornecedorId,
      status: vinculoStatus,
    };

    if (+vinculoStatus === +linkStatusEnum.reprovado) {
      whereVinculo.status = {
        $in: [+linkStatusEnum.reprovado, +linkStatusEnum.cancelado],
      };
    }

    if (dataCadastroInicio && dataCadastroFim) {
      whereVinculo.createdAt = {
        $between: [dataInicio, dataFim],
      };
    } else if (dataCadastroInicio) {
      whereVinculo.createdAt = { $gte: dataInicio };
    } else if (dataCadastroFim) {
      whereVinculo.createdAt.$lte = dataFim;
    }

    return db.entities.participanteVinculo.findAll({
      attributes: [
        'createdAt',
        'updatedAt',
        'diasAprovacao',
        'exibeValorDisponivel',
        'id',
        'participanteEstabelecimentoId',
        'participanteFornecedorId',
        'status',
        'valorMaximoExibicao',
        'motivoTipoRecusaId',
        'motivoRecusaObservacao',
      ],
      include: [
        {
          model: db.entities.motivoTipoRecusa,
          as: 'recusa',
          include: [{
            model: db.entities.motivoRecusa,
            as: 'motivoRecusa',
            attributes: ['id', 'descricao', 'requerObservacao'],
          }],
          required: false,
        },
        {
          model: db.entities.participanteEstabelecimento,
          as: 'estabelecimento',
          attributes: ['participanteId'],
          include: [{
            model: db.entities.participante,
            as: 'participante',
            attributes: ['id', 'nome', 'documento'],
            where: whereParticipante,
            required: true,
          }],
          required: false,
        }],
      where: whereVinculo,
    });
  }

  function getValoresDisponiveisParaCessao(vinculos) {
    if (+vinculoStatus === +linkStatusEnum.aprovado) {
      const getAvailableValue = findAvailableValue(siscofWrapper);
      return Promise.all(vinculos.map(getAvailableValue));
    }
    return Promise.resolve(vinculos);
  }

  function mapVinculos(vinculos) {
    return vinculos.map(vinculo => ({
      dataCadastro: vinculo.createdAt,
      diasAprovacao: vinculo.diasAprovacao,
      exibeValorDisponivel: vinculo.exibeValorDisponivel,
      id: vinculo.id,
      participante: {
        documento: vinculo.estabelecimento.participante.documento,
        id: vinculo.estabelecimento.participante.id,
        nome: vinculo.estabelecimento.participante.nome,
      },
      motivoRecusa: vinculo.recusa
        && vinculo.recusa.motivoRecusa
        && vinculo.recusa.motivoRecusa.descricao
        && !vinculo.recusa.motivoRecusa.requerObservacao
        ? vinculo.recusa.motivoRecusa.descricao
        : vinculo.motivoRecusaObservacao,
      dataFimIndicacao: vinculo.recusa ? vinculo.updatedAt : null,
      status: vinculo.status,
      valorMaximoExibicao: vinculo.valorMaximoExibicao,
      valorDisponivel: vinculo.valorDisponivel,
    }));
  }

  return getVinculos()
    .then(getValoresDisponiveisParaCessao)
    .then(mapVinculos);
};

export default getProviderLinksUseCase;
