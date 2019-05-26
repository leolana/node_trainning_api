const { DateTime } = require('luxon');

// eslint-disable-next-line max-len
const deformatDocument = require('../../service/credenciamento/deformatDocument.service');

// eslint-disable-next-line max-len
const indicacaoStatus = require('../../service/participante/nominationStatus.enum');
const canalEntrada = require(
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
      filter.createdAt = {
        $gte: DateTime.fromISO(options.dataInicioSolicitacao)
          .toSQLDate(),
      };
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

  function get(filter) {
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
          status: indicacaoStatus.pendente,
          canalEntrada: canalEntrada.indicacaoPorEc,
        },
      });
  }

  function map(indicacoes) {
    return indicacoes.map(indicacao => ({
      documento: indicacao.documento,
      solicitante: indicacao.participante.nome,
      nome: indicacao.nome,
      telefone: indicacao.telefone,
      email: indicacao.email,
      data: indicacao.createdAt,
      status: indicacao.status,
      canalEntrada: indicacao.canalEntrada,
    }));
  }

  return assembleFilter(options)
    .then(get)
    .then(map);
};
