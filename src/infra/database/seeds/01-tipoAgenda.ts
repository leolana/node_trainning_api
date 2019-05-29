import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const now = new Date();
    const timestamp = { createdAt: now, updatedAt: now };

    const tipoAgenda = [
      { nome: 'Global Interna', ...timestamp },
      { nome: 'Rede Externa', ...timestamp },
      { nome: 'Rede Interna', ...timestamp },
    ];

    await queryInterface.bulkInsert('tipoAgenda', tipoAgenda, {});
  },
  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('tipoAgenda', null, {});
  },
};
