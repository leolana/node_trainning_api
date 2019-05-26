import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const now = new Date();
    const timestamp = { createdAt: now, updatedAt: now };

    const ticketMedio = [
      { descricao: 'Até R$ 10', ...timestamp },
      { descricao: 'Até R$ 50', ...timestamp },
      { descricao: 'Até R$ 100', ...timestamp },
      { descricao: 'Até R$ 200', ...timestamp },
      { descricao: 'Até R$ 500', ...timestamp },
      { descricao: 'Acima de R$ 500', ...timestamp },
    ];

    return queryInterface.bulkInsert('ticketMedio', ticketMedio, {});
  },
  down: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete('ticketMedio', null, {});
  },
};
