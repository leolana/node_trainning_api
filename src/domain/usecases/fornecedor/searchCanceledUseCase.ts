import { DateTime } from 'luxon';

import deformatDocument from '../../../domain/services/credenciamento/deformatDocument';

import participanteIndicacaoStatus from '../../entities/participanteIndicacaoStatus';
import participateNominationSourceEnum from '../../entities/participateNominationSourceEnum';

const searchCanceledUseCase = db => (options) => {
  const fields = [
    'tipoPessoa',
    'nome',
    'email',
    'telefone',
  ];

  function assembleFilter(assembleFilterOptions) {
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
      filter.dataFimIndicacao = {
        $gte: DateTime.fromISO(assembleFilterOptions.dataInicioSolicitacao)
          .toSQLDate(),
      };
    }

    if ('dataFimSolicitacao' in assembleFilterOptions) {
      filter.dataFimIndicacao = Object.assign(filter.dataFimIndicacao || {}, {
        $lte: DateTime.fromISO(assembleFilterOptions.dataFimSolicitacao)
          .plus({ day: 1 })
          .toSQLDate(),
      });
    }

    return Promise.resolve(filter);
  }

  function getCanceled(filter) {
    return db.entities.participanteIndicacao
      .findAll({
        attributes: ['documento', 'createdAt', 'canalEntrada',
          'motivo', 'dataFimIndicacao'],
        include: [
          {
            model: db.entities.participante,
            attributes: ['nome'],
            required: true,
          },
          {
            model: db.entities.motivoTipoRecusa,
            include: [{
              model: db.entities.motivoRecusa,
              as: 'motivoRecusa',
              attributes: ['id', 'descricao', 'requerObservacao'],
              where: { ativo: true },
              required: false,
            }],
            required: false,
          },
        ],
        where: {
          ...filter,
          status: participanteIndicacaoStatus.reprovado,
          canalEntrada: participateNominationSourceEnum.indicacaoPorEc,
        },
      });
  }

  function map(fornecedores) {
    fornecedores.forEach((f) => {
      if (f.motivoTipoRecusa
        && f.motivoTipoRecusa.motivoRecusa
        && !f.motivoTipoRecusa.motivoRecusa.requerObservacao) {
        f.motivo = f.motivoTipoRecusa.motivoRecusa.descricao;
      }
    });

    return fornecedores.map(f => ({
      documento: f.documento,
      dataCadastro: f.createdAt,
      canalEntrada: f.canalEntrada,
      nome: f.participante.nome,
      motivoCancelamento: f.motivo,
      dataCancelamento: (f.motivoTipoRecusa && f.motivoTipoRecusa.motivoRecusa)
        ? f.dataFimIndicacao : null,
    }));
  }

  return assembleFilter(options)
    .then(getCanceled)
    .then(map);
};

export default searchCanceledUseCase;
