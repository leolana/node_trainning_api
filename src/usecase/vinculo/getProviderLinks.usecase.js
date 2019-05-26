const { DateTime } = require('luxon');
const availableValue = require('../../service/vinculo/findAvailableValue.util');

const vinculoStatusEnum = require(
  '../../service/vinculo/status.enum'
);

module.exports = (db, siscofWrapper) => (
  fornecedorId,
  vinculoStatus,
  nome,
  documento,
  dataCadastroInicio,
  dataCadastroFim
) => {
  function getVinculos() {
    const whereParticipante = {
      ativo: true,
    };
    if (nome) {
      whereParticipante.nome = { $iLike: `%${nome}%` };
    }
    if (documento) {
      whereParticipante.documento = { $like: `%${documento}%` };
    }

    if (dataCadastroInicio) {
      dataCadastroInicio = DateTime.fromJSDate(
        new Date(dataCadastroInicio)
      ).toSQLDate();
    }

    if (dataCadastroFim) {
      const date = DateTime.fromJSDate(
        new Date(dataCadastroFim)
      ).plus({ days: 1 });
      dataCadastroFim = date.toSQLDate();
    }

    const whereVinculo = {
      participanteFornecedorId: fornecedorId,
      status: vinculoStatus,
    };

    if (+vinculoStatus === +vinculoStatusEnum.reprovado) {
      whereVinculo.status = {
        $in: [+vinculoStatusEnum.reprovado, +vinculoStatusEnum.cancelado],
      };
    }

    if (dataCadastroInicio && dataCadastroFim) {
      whereVinculo.createdAt = {
        $between: [dataCadastroInicio, dataCadastroFim],
      };
    } else if (dataCadastroInicio) {
      whereVinculo.createdAt = { $gte: dataCadastroInicio };
    } else if (dataCadastroFim) {
      whereVinculo.createdAt.$lte = dataCadastroFim;
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
    if (+vinculoStatus === +vinculoStatusEnum.aprovado) {
      const getAvailableValue = availableValue(siscofWrapper);
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
