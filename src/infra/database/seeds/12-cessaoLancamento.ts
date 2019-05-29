import { QueryInterface } from 'sequelize';
import { DateTime } from 'luxon';

module.exports = {
  up: async (queryInterface: QueryInterface) => {

    const now = DateTime.local();
    const timestamp = { createdAt: now.toSQL(), updatedAt: now.toSQL() };

    const cessoesLancamentosStatus = [
      { nome: 'Pendente', ...timestamp },
      { nome: 'Enviado', ...timestamp },
      { nome: 'Confirmado', ...timestamp },
    ];

    const cessoesLancamentosTipos = [
      { nome: 'Taxa de Cessao', ...timestamp },
      { nome: 'Ajuste', ...timestamp },
      { nome: 'Cancelamento de Lançamento', ...timestamp },
    ];

    await queryInterface.
      bulkInsert('cessaoLancamentoStatus', cessoesLancamentosStatus, <any>{ returning: true });

    await queryInterface.bulkInsert('cessaoLancamentoTipo', cessoesLancamentosTipos, <any>{ returning: true });

    const cessaoLancamento = [
      {
        cessaoId: 1,
        lancamentoTipoId: 1,
        participanteId: 1,
        cessaoLancamentoStatusId: 1,
        valor: 10.0,
        data:  now.toSQL(),
        chaveDestino: null,
        ...timestamp
      },
      {
        cessaoId: 2,
        lancamentoTipoId: 1,
        participanteId: 2,
        cessaoLancamentoStatusId: 1,
        valor: 5.0,
        data:  now.toSQL(),
        chaveDestino: null,
        ...timestamp
      }
    ];

    await queryInterface.bulkInsert('cessaoLancamento', cessaoLancamento, {});
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('cessaoLancamento', null, {});
    await Promise.all([
      queryInterface.bulkDelete('cessaoLancamentoStatus', null, {}),
      queryInterface.bulkDelete('cessaoLancamentoTipo', null, {}),
    ]);
  }
};
