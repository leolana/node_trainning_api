const { DateTime } = require('luxon');

// eslint-disable-next-line max-len
const deformatDocument = require('../../service/credenciamento/deformatDocument.service');

// eslint-disable-next-line max-len
const indicacaoStatus = require('../../service/participante/nominationStatus.enum');
const tipoCanalEntrada = require(
  '../../service/participante/nominationSource.enum'
);

module.exports = db => (options) => {
  const fields = [
    'tipoPessoa',
    'nome',
    'email',
    'telefone',
  ];

  function assembleFilter(options) {
    options = options || {};
    const filter = {};

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];

      if (field in options) {
        filter[field] = options[field];
      }
    }

    if ('documento' in options) {
      filter.documento = {
        $iLike: `%${deformatDocument(options.documento)}%`,
      };
    }

    if ('dataInicioSolicitacao' in options) {
      filter.dataFimIndicacao = {
        $gte: DateTime.fromISO(options.dataInicioSolicitacao)
          .toSQLDate(),
      };
    }

    if ('dataFimSolicitacao' in options) {
      filter.dataFimIndicacao = Object.assign(filter.dataFimIndicacao || {}, {
        $lte: DateTime.fromISO(options.dataFimSolicitacao)
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
          status: indicacaoStatus.reprovado,
          canalEntrada: tipoCanalEntrada.indicacaoPorEc,
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
