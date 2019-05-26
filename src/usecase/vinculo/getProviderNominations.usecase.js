
const { DateTime } = require('luxon');

const canalEntrada = require(
  '../../service/participante/nominationSource.enum'
);

module.exports = db => (
  fornecedorId,
  nominationStatus,
  nome,
  documento,
  dataCadastroInicio,
  dataCadastroFim
) => {
  function get() {
    const filter = {
      participanteId: fornecedorId,
      status: nominationStatus,
      canalEntrada: canalEntrada.indicacaoPorFornecedor,
    };

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

    if (nome) {
      filter.nome = { $iLike: `%${nome}%` };
    }

    if (documento) {
      filter.documento = { $like: `%${documento}%` };
    }

    if (dataCadastroInicio && dataCadastroFim) {
      filter.createdAt = {
        $between: [dataCadastroInicio, dataCadastroFim],
      };
    } else if (dataCadastroInicio) {
      filter.createdAt = { $gte: dataCadastroInicio };
    } else if (dataCadastroFim) {
      filter.createdAt.$lte = dataCadastroFim;
    }


    return db.entities.participanteIndicacao
      .findAll({
        attributes: [
          'id',
          'nome',
          'documento',
          'email',
          'createdAt',
          'canalEntrada',
          'telefone',
          'motivo',
          'dataFimIndicacao',
        ],
        where: filter,
        include: [
          {
            model: db.entities.motivoTipoRecusa,
            include: [{
              model: db.entities.motivoRecusa,
              as: 'motivoRecusa',
              attributes: ['id', 'descricao', 'requerObservacao'],
              where: { ativo: true },
            }],
            required: false,
          },
        ],
      });
  }

  function map(indicacoes) {
    return indicacoes.map(indicacao => ({
      id: indicacao.id,
      nome: indicacao.nome,
      documento: indicacao.documento,
      dataCadastro: indicacao.createdAt,
      canalEntrada: indicacao.canalEntrada,
      telefone: indicacao.telefone,
      email: indicacao.email,
      motivoRecusa: indicacao.motivoTipoRecusa
      && indicacao.motivoTipoRecusa.motivoRecusa
      && indicacao.motivoTipoRecusa.motivoRecusa.descricao
      && !indicacao.motivoTipoRecusa.motivoRecusa.requerObservacao
        ? indicacao.motivoTipoRecusa.motivoRecusa.descricao
        : indicacao.motivo,
      dataFimIndicacao: indicacao.dataFimIndicacao,
    }));
  }
  return get().then(map);
};
