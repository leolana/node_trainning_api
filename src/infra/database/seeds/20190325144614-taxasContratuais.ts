import { QueryInterface } from 'sequelize';
import { DateTime } from 'luxon';

import { defaultUser } from '../consts';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const now = DateTime.local();
    const today = now.toSQLDate();
    const timestamp = { createdAt: now.toSQL(), updatedAt: now.toSQL() };

    const taxasContratuais = [
      {
        tipoPessoa: null,
        inicio: today,
        fim: null,
        antecipacao: 1.8,
        adesao: 250,
        maximoParcelas: '12',
        usuario: defaultUser,
        ...timestamp
      }
    ];

    return queryInterface.bulkInsert('taxaContratual', taxasContratuais, {});
  },

  down: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete('taxaContratual', null, {});
  }
};
