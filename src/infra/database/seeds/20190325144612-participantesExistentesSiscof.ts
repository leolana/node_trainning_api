import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const now = new Date();
    const timestamp = { createdAt: now, updatedAt: now };

    const participantes = [
      { participanteId: 410, documento: '54447115000158', ...timestamp },
      { participanteId: 73724, documento: '52780376000160', ...timestamp },
    ];

    return queryInterface.bulkInsert('participanteExistenteSiscof', participantes, {});
  },

  down: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete('participanteExistenteSiscof', null, {});
  }
};
