import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const now = new Date();
    const timestamp = { createdAt: now, updatedAt: now };

    const adquirentes = [
      { nome: 'Global', ...timestamp },
      { nome: 'Rede', ...timestamp },
    ];

    return queryInterface.bulkInsert('adquirente', adquirentes, {});
  },
  down: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete('adquirente', null, {});
  },
};
