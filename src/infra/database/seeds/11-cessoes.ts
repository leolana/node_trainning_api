import { QueryInterface } from 'sequelize';
import { DateTime } from 'luxon';

import { defaultUser } from '../consts';
import cessaoDiluicaoPagamento from '../../../domain/entities/cessaoDiluicaoPagamento';
import { CessaoStatus } from '../models/CessaoStatus';
import { CessaoTipo } from '../models/CessaoTipo';

module.exports = {
  up: async (queryInterface: QueryInterface) => {

    const now = DateTime.local();
    const timestamp = { createdAt: now.toSQL(), updatedAt: now.toSQL() };

    const defaultDataVencimento = now.plus({ month: 1 }).toSQLDate();
    const defaultDataExpiracao = now.plus({ month: 1 }).toSQLDate();

    const cessoesStatus = [
      { nome: 'Aguardando Aprovacao', ...timestamp },
      { nome: 'Aprovado', ...timestamp },
      { nome: 'Recusado', ...timestamp },
      { nome: 'Falha', ...timestamp },
      { nome: 'Expirada', ...timestamp },
    ];

    const cessoesTipos = [
      { nome: 'Cessao', ...timestamp },
      { nome: 'Recorrente Aprovacao Automatica', ...timestamp },
      { nome: 'Parcelada', ...timestamp },
    ];

    const statusCreated = (await queryInterface.bulkInsert('cessaoStatus', cessoesStatus, <any>{ returning: true })
    ) as CessaoStatus[];

    const tipoCreated = (await queryInterface.bulkInsert('cessaoTipo', cessoesTipos, <any>{ returning: true })
    ) as CessaoTipo[];

    const cessoes = [
      {
        participanteVinculoId: 1,
        solicitante: 'Charles Stone',
        usuario: defaultUser,
        cessaoStatusId: statusCreated[0].id,
        valorSolicitado: 10,
        valorDisponivel: 10,
        dataVencimento: defaultDataVencimento,
        dataExpiracao: defaultDataExpiracao,
        codigoCessao: '111111111',
        referencia: '123',
        cessaoTipoId: tipoCreated[0].id,
        diluicaoPagamento: cessaoDiluicaoPagamento.diaVencimento,
        numeroParcelas: null,
        ...timestamp
      },
      {
        participanteVinculoId: 2,
        solicitante: 'Charles Stone',
        usuario: defaultUser,
        cessaoStatusId: statusCreated[0].id,
        valorSolicitado: 100.07,
        valorDisponivel: 100,
        dataVencimento: now.minus({ year: 1 }).toSQLDate(),
        dataExpiracao: now.minus({ year: 1 }).toSQLDate(),
        codigoCessao: '22222222',
        cessaoTipoId: tipoCreated[0].id,
        diluicaoPagamento: cessaoDiluicaoPagamento.diaVencimento,
        numeroParcelas: null,
        ...timestamp
      }
    ];

    const recebiveis = [
      [ // Cessão 1
        {
          cessaoId: 1,
          transacaoId: 1,
          cancelado: false,
          ...timestamp
        },
        {
          cessaoId: 1,
          transacaoId: 1,
          cancelado: false,
          ...timestamp
        },
        {
          cessaoId: 1,
          transacaoId: 1,
          cancelado: false,
          ...timestamp
        },
      ],
      [ // Cessão 2
        {
          cessaoId: 2,
          transacaoId: 2,
          cancelado: false,
          ...timestamp
        },
        {
          cessaoId: 2,
          transacaoId: 2,
          cancelado: false,
          ...timestamp
        },
        {
          cessaoId: 2,
          transacaoId: 2,
          cancelado: false,
          ...timestamp
        },
      ],
    ];

    await queryInterface.bulkInsert('cessao', cessoes, {});

    await queryInterface.bulkInsert('cessaoRecebivel', recebiveis, {});
  },

  down: async (queryInterface: QueryInterface) => {
    await Promise.all([
      queryInterface.bulkDelete('cessaoAceite', null, {}),
      queryInterface.bulkDelete('cessaoHistorico', null, {}),
      queryInterface.bulkDelete('cessaoRecebivelHistorico', null, {})
    ]);
    await queryInterface.bulkDelete('cessaoRecebivel', null, {});
    await queryInterface.bulkDelete('cessaoParametro', null, {});
    await queryInterface.bulkDelete('cessao', null, {});
    return Promise.all([
      queryInterface.bulkDelete('cessaoStatus', null, {}),
      queryInterface.bulkDelete('cessaoTipo', null, {}),
      queryInterface.bulkDelete('cessaoTipoParametro', null, {}),
    ]);
  }
};
