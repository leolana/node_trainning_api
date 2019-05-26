import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const now = new Date();
    const timestamp = { createdAt: now, updatedAt: now };

    const faturamentoCartao = [
      { descricao: 'Até 100.000', ...timestamp },
      { descricao: 'Entre 100.000 e 400.000', ...timestamp },
      { descricao: 'Entre 400.000 e 800.000', ...timestamp },
      { descricao: 'Acima de 800.000', ...timestamp },
    ];

    return queryInterface.bulkInsert('faturamentoCartao', faturamentoCartao, {});
  },
  down: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete('faturamentoCartao', null, { });
  },
};
