import { QueryInterface } from 'sequelize';
import { DateTime } from 'luxon';

import { defaultUser } from '../consts';
import cessaoStatus from '../../../domain/entities/cessaoStatus';
import cessaoTipo from '../../../domain/entities/cessaoTipo';
import cessaoDiluicaoPagamento from '../../../domain/entities/cessaoDiluicaoPagamento';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const sequelize = queryInterface.sequelize;

    const now = DateTime.local();
    const timestamp = { createdAt: now.toSQL(), updatedAt: now.toSQL() };

    const defaultDataVencimento = now.plus({ month: 1 }).toSQLDate();
    const defaultDataExpiracao = now.plus({ month: 1 }).toSQLDate();
    const defaultDataVenda = now.set({ month: 1, day: 1 }).toSQL();

    const cessoes = [
      {
        participanteVinculoId: null,
        usuario: defaultUser,
        valorSolicitado: 10,
        valorDisponivel: 10,
        dataVencimento: defaultDataVencimento,
        dataExpiracao: defaultDataExpiracao,
        referencia: '123',
        codigoCessao: '111111111',
        solicitante: 'Charles Stone',
        status: cessaoStatus.aguardandoAprovacao,
        tipo: cessaoTipo.cessao,
        diluicaoPagamento: cessaoDiluicaoPagamento.diaVencimento,
        codigoRetornoSiscof: null,
        mensagemRetornoSiscof: null,
        taxaCessao: null,
        fornecedorAceiteTermoId: null,
        estabelecimentoAceiteTermoId: null,
        dataRespostaEstabelecimento: null,
        numeroParcelas: null,
        ...timestamp
      },
      {
        participanteVinculoId: null,
        usuario: defaultUser,
        valorSolicitado: 100.07,
        valorDisponivel: 100,
        dataVencimento: now.minus({ year: 1 }).toSQLDate(),
        dataExpiracao: now.minus({ year: 1 }).toSQLDate(),
        codigoCessao: '22222222',
        solicitante: 'Charles Stone',
        status: cessaoStatus.aguardandoAprovacao,
        tipo: cessaoTipo.cessao,
        diluicaoPagamento: cessaoDiluicaoPagamento.diaVencimento,
        codigoRetornoSiscof: null,
        mensagemRetornoSiscof: null,
        taxaCessao: null,
        fornecedorAceiteTermoId: null,
        estabelecimentoAceiteTermoId: null,
        dataRespostaEstabelecimento: null,
        numeroParcelas: null,
        ...timestamp
      }
    ];

    const recebiveis = [
      [ // Cessão 1
        {
          cessaoId: null,
          dataVenda: defaultDataVenda,
          valorVenda: 5,
          eventoId: 1,
          dataReserva: null,
          dataPagarEc: null,
          nsu: null,
          numeroParcela: null,
          totalParcelas: null,
          statusPagamento: null,
          ...timestamp
        },
        {
          cessaoId: null,
          dataVenda: defaultDataVenda,
          valorVenda: 5,
          eventoId: 1,
          dataReserva: null,
          dataPagarEc: null,
          nsu: null,
          numeroParcela: null,
          totalParcelas: null,
          statusPagamento: null,
          ...timestamp
        },
        {
          cessaoId: null,
          dataVenda: defaultDataVenda,
          valorVenda: 7,
          eventoId: 123,
          dataReserva: null,
          dataPagarEc: null,
          nsu: null,
          numeroParcela: null,
          totalParcelas: null,
          statusPagamento: null,
          ...timestamp
        },
      ],
      [ // Cessão 2
        {
          cessaoId: null,
          dataVenda: defaultDataVenda,
          valorVenda: 50,
          eventoId: 1,
          dataReserva: null,
          dataPagarEc: null,
          nsu: null,
          numeroParcela: null,
          totalParcelas: null,
          statusPagamento: null,
          ...timestamp
        },
        {
          cessaoId: null,
          dataVenda: defaultDataVenda,
          valorVenda: 44,
          eventoId: 1,
          dataReserva: null,
          dataPagarEc: null,
          nsu: null,
          numeroParcela: null,
          totalParcelas: null,
          statusPagamento: null,
          ...timestamp
        },
        {
          cessaoId: null,
          dataVenda: defaultDataVenda,
          valorVenda: 6,
          eventoId: 123,
          dataReserva: null,
          dataPagarEc: null,
          nsu: null,
          numeroParcela: null,
          totalParcelas: null,
          statusPagamento: null,
          ...timestamp
        },
      ],
    ];

    const vinculos = (await sequelize.query(
      'SELECT id FROM "participanteVinculo";',
      { type: sequelize.QueryTypes.SELECT }
    )) as any[];

    const dataCessoes = vinculos.reduce((acc, curr) => {
      return acc.concat(cessoes.map((c) => {
        c.participanteVinculoId = curr.id;
        return c;
      }));
    },                                  []);

    const inserted = (await queryInterface.bulkInsert('cessao', dataCessoes, { returning: true })) as any[];

    const dataRecebiveis = recebiveis.reduce((acc, curr, i) => {
      return acc.concat(curr.map((c) => {
        c.cessaoId = inserted[i].id;
        return c;
      }));
    },                                       []);

    return queryInterface.bulkInsert('cessaoRecebivel', dataRecebiveis, {});
  },

  down: async (queryInterface: QueryInterface) => {
    await Promise.all([
      queryInterface.bulkDelete('cessaoAceite', null, {}),
      queryInterface.bulkDelete('cessaoHistorico', null, {}),
      queryInterface.bulkDelete('cessaoRecebivelHistorico', null, {})
    ]);
    await queryInterface.bulkDelete('cessaoRecebivel', null, {});
    return queryInterface.bulkDelete('cessao', null, {});
  }
};
