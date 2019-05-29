import { DateTime } from 'luxon';
import deformatDocument from '../../services/document/deformatDocument';

const searchNominationsUseCase = db => async (searchNominationsOptions) => {
  const fields = [
    'tipoPessoa',
    'documento',
    'nome',
    'email',
    'telefone',
    'canalEntrada',
    'status',
  ];

  const assembleFilter = (options) => {
    const filters: any = {};

    for (const field of fields) {
      if (field in options) {
        filters[field] = options[field];
      }
    }

    if ('documento' in options) {
      filters.documento = {
        $iLike: `%${deformatDocument(options.documento)}%`,
      };
    }

    if ('dataInicioSolicitacao' in options) {
      filters.createdAt = {
        $gte: DateTime.fromISO(options.dataInicioSolicitacao)
          .toSQLDate(),
      };
    }

    if ('dataFimSolicitacao' in options) {
      filters.createdAt = Object.assign(filters.createdAt || {}, {
        $lte: DateTime.fromISO(options.dataFimSolicitacao)
          .plus({ day: 1 })
          .toSQLDate(),
      });
    }

    return filters;
  };

  const search = filters => db.entities.participante
    .findAll({
      attributes: ['id', 'nome'],
      include: [{
        model: db.entities.participanteIndicacao,
        as: 'indicacoes',
        where: filters,
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

  const checkIfExists = (data: any[]) => db.entities.credenciamento
    .findAll({
      where: {
        ativo: true,
        documento: data.map(d => d.documento),
      },
      attributes: ['id', 'documento', 'status'],
    });

  const mapData = results => results.reduce(
    (acc, current) => {
      return acc.concat(current.indicacoes.map(n => ({
        ...n.dataValues,
        motivo: n.motivoTipoRecusa
        && n.motivoTipoRecusa.motivoRecusa
        && !n.motivoTipoRecusa.motivoRecusa.requerObservacao
        ? n.motivoTipoRecusa.motivoRecusa.descricao
        : n.motivo,
        solicitanteId: current.id,
        solicitanteNome: current.nome,
      })));
    },
    []
  );

  const addData = (nominations, registrations) => {
    const registrationMap = {};

    for (const registration of registrations) {
      registrationMap[registration.documento] = {
        id: registration.id,
        status: registration.status,
      };
    }

    nominations.forEach((n) => {
      if (n.documento in registrationMap) {
        n.credenciamentoId = registrationMap[n.documento].id;
        n.credenciamentoStatus = registrationMap[n.documento].status;
      } else {
        n.credenciamentoId = null;
        n.credenciamentoStatus = null;
      }
    });

    return nominations;
  };

  const filter = assembleFilter(searchNominationsOptions);
  const participants = mapData(await search(filter));
  const checks = await checkIfExists(participants);
  return addData(participants, checks);
};

export default searchNominationsUseCase;
