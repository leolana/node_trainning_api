import { DateTime } from 'luxon';
import { typeCanalEntrada } from '../../services/participante/typeEnum';
import deformatDocument from '../../services/credenciamento/deformatDocument';
import ParticipanteIntegracaoTipo from '../../entities/ParticipanteIntegracaoTipo';
import ParticipanteIntegracaoStatus from '../../entities/ParticipanteIntegracaoStatus';

const searchRegisteredUseCase = db => (searchFilters) => {
  const fields = [
    'id',
    'tipoPessoa',
    'nome',
    'telefone',
  ];

  function assembleFilter(options) {
    const filter: any = {};

    for (const field of fields) {
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

  const map = (fornecedoresIndicacoes) => {
    return fornecedoresIndicacoes.fornecedores.map(fornecedor => ({
      id: fornecedor.participante.id,
      participanteId: fornecedor.participante.id,
      documento: fornecedor.participante.documento,
      nome: fornecedor.participante.nome,
      data: fornecedor.participante.createdAt,
      status: fornecedor.participante.ativo,
      numero: fornecedor.participante.numero,
      qtdVinculos: fornecedor.vinculos ? fornecedor.vinculos.length : 0,
      canalEntrada: fornecedoresIndicacoes.indicacoes
        .find(doc => doc.documento === fornecedor.participante.documento) ?
        typeCanalEntrada.estabelecimento : typeCanalEntrada.backoffice,
      integracaoMovidesk: fornecedor.participante.integracoes
        .some(integracao => integracao.tipoIntegracao === ParticipanteIntegracaoTipo.movidesk),
    }));
  };

  const get = (filter) => {
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
        include: [{
          model: db.entities.participanteIntegracao,
          required: false,
          as: 'integracoes',
          where: {
            status: ParticipanteIntegracaoStatus.concluido
          }
        }]
      }, {
        model: db.entities.participanteVinculo,
        as: 'vinculos',
        attributes: ['id'],
        required: false,
      }],
    });
  };

  const getCanalEntrada = async (fornecedores) => {
    const fornecedoresDocs = fornecedores
      .map(forn => forn.participante.documento);

    const indicacoes = await db.entities.participanteIndicacao.findAll({
      attributes: ['documento'],
      where: {
        documento: fornecedoresDocs
      },
    });

    return { fornecedores, indicacoes };
  };

  return assembleFilter(searchFilters)
    .then(get)
    .then(getCanalEntrada)
    .then(map);
};

export default searchRegisteredUseCase;
