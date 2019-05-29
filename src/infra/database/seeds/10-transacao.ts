
import { QueryInterface, QueryTypes } from 'sequelize';
import { DateTime } from 'luxon';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const now = DateTime.local();
    const timestamp = { createdAt: now.toSQL(), updatedAt: now.toSQL() };
    const defaultDataVenda = now.set({ month: 1, day: 1 }).toSQL();
    const defaultDataPagar = now.set({ month: 3, day: 1 }).toSQL();
    
    const transacoes = [
      {
        dataVenda: defaultDataVenda,
        valorVenda: 5,
        dataPagar: defaultDataPagar,
        valorPagar: 4,
        nsu: 'AAAFOnAAAAAABpNAAE',
        numeroParcela: 1,
        totalParcelas: 1,
        autorizacao: null,
        chaveOrigem: '...',
        participanteId: 1,
        participanteOriginal: 1,
        produtoId: 2,
        adquirenteId: 1,
        bandeiraId: 1,
        tipoAgendaId: 1,
        ...timestamp
      },
      {
        dataVenda: defaultDataVenda,
        valorVenda: 10,
        dataPagar: defaultDataPagar,
        valorPagar: 9,
        nsu: 'AAAFOnAAAAAABpNAAE',
        numeroParcela: 1,
        totalParcelas: 1,
        autorizacao: null,
        chaveOrigem: '...',
        participanteId: 2,
        participanteOriginal: 2,
        produtoId: 1,
        adquirenteId: 1,
        bandeiraId: 1,
        tipoAgendaId: 1,
        ...timestamp
      },
      {
        dataVenda: defaultDataVenda,
        valorVenda: 50,
        dataPagar: defaultDataPagar,
        valorPagar: 49,
        nsu: 'AAAFOnAAAAAABpNAAE',
        numeroParcela: 1,
        totalParcelas: 1,
        autorizacao: null,
        chaveOrigem: '...',
        participanteId: 1,
        participanteOriginal: 1,
        produtoId: 2,
        adquirenteId: 1,
        bandeiraId: 3,
        tipoAgendaId: 1,
        ...timestamp
      },
      {
        dataVenda: defaultDataVenda,
        valorVenda: 10,
        dataPagar: defaultDataPagar,
        valorPagar: 9,
        nsu: 'AAAFOnAAAAAABpNAAE',
        numeroParcela: 1,
        totalParcelas: 1,
        autorizacao: null,
        chaveOrigem: '...',
        participanteId: 1,
        participanteOriginal: 1,
        produtoId: 1,
        adquirenteId: 1,
        bandeiraId: 1,
        tipoAgendaId: 1,
        ...timestamp
      },
      {
        dataVenda: defaultDataVenda,
        valorVenda: 5,
        dataPagar: defaultDataPagar,
        valorPagar: 4,
        nsu: 'AAAFOnAAAAAABpNAAE',
        numeroParcela: 1,
        totalParcelas: 1,
        autorizacao: null,
        chaveOrigem: '...',
        participanteId: 2,
        participanteOriginal: 2,
        produtoId: 2,
        adquirenteId: 2,
        bandeiraId: 2,
        tipoAgendaId: 2,
        ...timestamp
      },
      {
        dataVenda: defaultDataVenda,
        valorVenda: 45,
        dataPagar: defaultDataPagar,
        valorPagar: 44,
        nsu: 'AAAFOnAAAAAABpNAAE',
        numeroParcela: 1,
        totalParcelas: 1,
        autorizacao: null,
        chaveOrigem: '...',
        participanteId: 1,
        participanteOriginal: 1,
        produtoId: 2,
        adquirenteId: 1,
        bandeiraId: 2,
        tipoAgendaId: 1,
        ...timestamp
      },
    ];
    await queryInterface.bulkInsert('transacao', transacoes, {});
  },

  down: async (queryInterface: QueryInterface) => {
    await Promise.all([
      queryInterface.bulkDelete('transacao', null, {}),
      queryInterface.bulkDelete('transacaoHistorico', null, {})
    ]);
  }
};
