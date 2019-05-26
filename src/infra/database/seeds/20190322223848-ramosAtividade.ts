import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const now = new Date();
    const timestamp = { createdAt: now, updatedAt: now };

    const ramoAtividade = [
      {
        codigo: 742,
        descricao: 'Veterinaria',
        ativo: true,
        restritoPJ: false,
        departamento: 2,
        ...timestamp
      },
      {
        codigo: 763,
        descricao: 'Cooperativa Agrícola',
        ativo: true,
        restritoPJ: true,
        departamento: 901,
        ...timestamp
      },
      {
        codigo: 1761,
        descricao: 'Metalurgicos',
        ativo: false,
        restritoPJ: true,
        departamento: 902,
        ...timestamp
      },
      {
        codigo: 1740,
        descricao: 'Pedreiros e Serviços de Instalação',
        ativo: false,
        restritoPJ: true,
        departamento: 903,
        ...timestamp
      }
    ];

    return queryInterface.bulkInsert('ramoAtividade', ramoAtividade, {});
  },
  down: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete('ramoAtividade', null, {});
  },
};
