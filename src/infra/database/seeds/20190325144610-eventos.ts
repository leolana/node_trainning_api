import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const now = new Date();
    const timestamp = { createdAt: now, updatedAt: now };

    const eventos = [
      { id: 1, nome: 'Débito', ...timestamp },
      { id: 2, nome: 'Crédito à vista', ...timestamp },
      { id: 3, nome: 'Parcelado 2 a 6', ...timestamp },
      { id: 4, nome: 'Parcelado 7 a 12', ...timestamp },
      { id: 100, nome: 'Aluguel POS', ...timestamp },
      { id: 101, nome: 'Cancelamento Débito', ...timestamp },
      { id: 102, nome: 'Cancelamento Crédito', ...timestamp },
      { id: 103, nome: 'Substituição Recebível', ...timestamp },
      { id: 121, nome: 'Ajuste à crédito para o EC', ...timestamp },
      { id: 133, nome: 'Ajustes de cessão', ...timestamp },
      { id: 123, nome: 'Ajustes de reserva de cessão', ...timestamp },
      { id: 22, nome: 'Reserva crédito à vista', ...timestamp },
      { id: 23, nome: 'Reserva parcelado 2 a 6', ...timestamp },
      { id: 24, nome: 'Reserva parcelado 7 a 12', ...timestamp },
      { id: 32, nome: 'Cessão Crédito à vista', ...timestamp },
      { id: 33, nome: 'Cessão Parcelado 2 a 6', ...timestamp },
      { id: 34, nome: 'Cessão Parcelado 7 a 12', ...timestamp },
      { id: 222, nome: 'Tarifa Cessão', ...timestamp },
      { id: 112, nome: 'Crédito à vista antecipado ', ...timestamp },
      { id: 113, nome: 'Parcelado 2 a 6 antecipado', ...timestamp },
      { id: 114, nome: 'Parcelado 7 a 12 antecipado', ...timestamp },
      { id: 122, nome: 'Ajuste à débito', ...timestamp },
    ];

    return queryInterface.bulkInsert('evento', eventos, {});
  },

  down: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete('evento', null, {});
  }
};
