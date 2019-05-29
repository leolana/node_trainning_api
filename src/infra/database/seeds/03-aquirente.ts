import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const now = new Date();
    const timestamp = { createdAt: now, updatedAt: now };

    const adquirentes = [
      { nome: 'Global', ...timestamp },
      { nome: 'Rede', ...timestamp },
    ];

    await queryInterface.bulkInsert('adquirente', adquirentes, {});
  },
  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('adquirente', null, {});
  },
};
