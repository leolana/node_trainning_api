import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const now = new Date();
    const timestamp = { createdAt: now, updatedAt: now };

    const cidades = [
      { nome: 'Santos', estado: 'SP', ...timestamp },
      { nome: 'Sorocaba', estado: 'SP', ...timestamp },
      { nome: 'São Paulo', estado: 'SP', ...timestamp },
    ];

    return queryInterface.bulkInsert('cidade', cidades, {  });
  },
  down: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete('cidade', null, {});
  },
};
