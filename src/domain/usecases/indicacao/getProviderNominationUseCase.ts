import { DateTime } from 'luxon';
import participateNominationSourceEnum from '../../entities/participateNominationSourceEnum';

const getProviderNominationUseCase = db => (
  fornecedorId,
  nominationStatus,
  nome,
  documento,
  dataCadastroInicio,
  dataCadastroFim
) => {

  function get() {
    const filter: any = {
      participanteId: fornecedorId,
      status: nominationStatus,
      canalEntrada: participateNominationSourceEnum.indicacaoPorFornecedor,
    };
    let dataInicio;
    let dataFim;

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

    if (nome) {
      filter.nome = { $iLike: `%${nome}%` };
    }

    if (documento) {
      filter.documento = { $like: `%${documento}%` };
    }

    if (dataCadastroInicio && dataCadastroFim) {
      filter.createdAt = {
        $between: [dataInicio, dataFim],
      };
    } else if (dataCadastroInicio) {
      filter.createdAt = { $gte: dataInicio };
    } else if (dataCadastroFim) {
      filter.createdAt.$lte = dataFim;
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

export default getProviderNominationUseCase;
