import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const now = new Date();
    const timestamp = { createdAt: now, updatedAt: now };

    const produtos = [
      { id: 1, nome: 'Débito', ...timestamp },
      { id: 2, nome: 'Crédito à vista', ...timestamp },
      { id: 3, nome: 'Crédito Parcelado', ...timestamp },
    ];

    return queryInterface.bulkInsert('produto', produtos, {});
  },

  down: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete('produto', null, {});
  }
};
