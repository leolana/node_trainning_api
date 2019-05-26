import { DateTime } from 'luxon';

import deformatDocument from '../../services/credenciamento/deformatDocument';
import participanteIndicacaoStatus from '../../entities/participanteIndicacaoStatus';
import participateNominationSourceEnum from '../../entities/participateNominationSourceEnum';

const searchPendingUseCase = db => (options) => {
  const fields = [
    'tipoPessoa',
    'nome',
    'email',
    'telefone',
  ];

  const assembleFilter = (assembleFilterOptions: any) => {
    const filter: any = {};

    for (const field of fields) {
      if (field in assembleFilterOptions) {
        filter[field] = assembleFilterOptions[field];
      }
    }

    if ('documento' in assembleFilterOptions) {
      filter.documento = {
        $iLike: `%${deformatDocument(assembleFilterOptions.documento)}%`,
      };
    }

    if ('dataInicioSolicitacao' in assembleFilterOptions) {
      filter.createdAt = {
        $gte: DateTime.fromISO(assembleFilterOptions.dataInicioSolicitacao)
          .toSQLDate(),
      };
    }

    if ('dataFimSolicitacao' in assembleFilterOptions) {
      filter.createdAt = Object.assign(filter.createdAt || {}, {
        $lte: DateTime.fromISO(assembleFilterOptions.dataFimSolicitacao)
          .plus({ day: 1 })
          .toSQLDate(),
      });
    }

    return Promise.resolve(filter);
  };

  const get = (filter) => {
    return db.entities.participanteIndicacao
      .findAll({
        attributes: ['documento', 'createdAt', 'status',
          'canalEntrada', 'nome', 'email', 'telefone'],
        include: [{
          model: db.entities.participante,
          attributes: ['nome'],
          required: true,
        }],
        where: {
          ...filter,
          status: participanteIndicacaoStatus.pendente,
          canalEntrada: participateNominationSourceEnum.indicacaoPorEc,
        },
      });
  };

  const map = (indicacoes) => {
    return indicacoes.map(indicacao => ({
      documento: indicacao.documento,
      solicitante: indicacao.participante.nome,
      nome: indicacao.nome,
      telefone: indicacao.telefone,
      email: indicacao.email,
      data: indicacao.createdAt,
      status: indicacao.status,
      canalEntrada: indicacao.canalEntrada
    }));
  };

  return assembleFilter(options)
    .then(get)
    .then(map);
};

export default searchPendingUseCase;
