const { DateTime } = require('luxon');

// eslint-disable-next-line max-len
const deformatDocument = require('../../service/credenciamento/deformatDocument.service');

module.exports = db => (options) => {
  const fields = [
    'id',
    'tipoPessoa',
    'nome',
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
      filter.createdAt = Object.assign(filter.createdAt || {}, {
        $gte: DateTime.fromISO(options.dataInicioSolicitacao)
          .toSQLDate(),
      });
    }

    if ('dataFimSolicitacao' in options) {
      filter.createdAt = Object.assign(filter.createdAt || {}, {
        $lte: DateTime.fromISO(options.dataFimSolicitacao)
          .plus({ day: 1 })
          .toSQLDate(),
      });
    }

    return Promise.resolve(filter);
  }

  function map(fornecedores) {
    return fornecedores.map(fornecedor => ({
      id: fornecedor.participante.id,
      documento: fornecedor.participante.documento,
      nome: fornecedor.participante.nome,
      data: fornecedor.participante.createdAt,
      status: fornecedor.participante.ativo,
      numero: fornecedor.participante.numero,
      qtdVinculos: fornecedor.vinculos ? fornecedor.vinculos.length : 0,
    }));
  }

  function get(filter) {
    return db.entities.participanteFornecedor.findAll({
      attributes: [],
      include: [{
        model: db.entities.participante,
        as: 'participante',
        attributes: [
          'id',
          'documento',
          'nome',
          'createdAt',
          'ativo',
          'numero',
        ],
        where: filter,
        required: true,
      }, {
        model: db.entities.participanteVinculo,
        as: 'vinculos',
        attributes: ['id'],
        required: false,
      }],
    });
  }

  return assembleFilter(options)
    .then(get)
    .then(map);
};
