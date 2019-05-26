const { DateTime } = require('luxon');
// eslint-disable-next-line max-len
const deformatDocument = require('../../service/credenciamento/deformatDocument.service');

module.exports = db => (options) => {
  const fields = [
    'tipoPessoa',
    'nome',
    'email',
    'telefone',
    'canalEntrada',
    'status',
  ];

  const assembleFilter = (options) => {
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
  };

  const search = filter => db.entities.participante
    .findAll({
      attributes: ['id', 'nome'],
      include: [{
        model: db.entities.participanteIndicacao,
        as: 'indicacoes',
        where: filter,
        attributes: [
          'id', 'nome', 'documento', 'email', 'telefone', 'status',
          'tipoPessoa', 'canalEntrada', 'dataFimIndicacao', 'motivo',
        ],
        include: [
          {
            model: db.entities.motivoTipoRecusa,
            include: [{
              model: db.entities.motivoRecusa,
              as: 'motivoRecusa',
              attributes: ['id', 'descricao', 'requerObservacao'],
              where: { ativo: true },
            }],
          },
        ],
        required: true,
      }],
    });

  const checkIfExists = data => db.entities.credenciamento
    .findAll({
      where: {
        ativo: true,
        documento: data.map(d => d.documento),
      },
      attributes: ['id', 'documento', 'status'],
    });

  const mapData = results => results.reduce((acc, current) => {
    acc = acc.concat(current.indicacoes.map(n => ({
      ...n.dataValues,
      motivo: n.motivoTipoRecusa
        && n.motivoTipoRecusa.motivoRecusa
        && !n.motivoTipoRecusa.motivoRecusa.requerObservacao
        ? n.motivoTipoRecusa.motivoRecusa.descricao
        : n.motivo,
      solicitanteId: current.id,
      solicitanteNome: current.nome,
    })));
    return acc;
  }, []);

  const addData = (nominations, registrations) => {
    const registrationMap = {};

    for (let i = 0; i < registrations.length; i++) {
      const registration = registrations[i];

      registrationMap[registration.documento] = {
        credenciamentoId: registration.id,
        credenciamentoStatus: registration.status,
      };
    }

    nominations.forEach((n) => {
      if (n.documento in registrationMap) {
        const registration = registrationMap[n.documento];

        Object.assign(n, registration);
      }
    });

    return nominations;
  };

  return assembleFilter(options)
    .then(search)
    .then(mapData)
    .then(data => checkIfExists(data)
      .then(results => addData(data, results)));
};
