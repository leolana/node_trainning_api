import { QueryInterface } from 'sequelize';
import { DateTime } from 'luxon';

import { defaultUser } from '../consts';
import { tiposCaptura } from '../models/captura';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const now = DateTime.local();
    const today = now.toSQLDate();
    const timestamp = { createdAt: now.toSQL(), updatedAt: now.toSQL() };

    const produtos = [
      {
        nome: 'POS com Fio',
        usuario: defaultUser,
        ativo: true,
        codigo: 4,
        ...timestamp
      },
      {
        nome: 'POS sem Fio',
        usuario: defaultUser,
        ativo: true,
        codigo: 4,
        ...timestamp
      },
      {
        nome: 'TEF',
        usuario: defaultUser,
        ativo: true,
        codigo: 7,
        ...timestamp
      },
      {
        nome: 'Gateway',
        usuario: defaultUser,
        ativo: true,
        ...timestamp
      },
    ];

    const capturas = [
      [{ // POS com Fio
        produtoId: null,
        inicio: today,
        fim: null,
        tipoCaptura: tiposCaptura.aluguel,
        valor: 55,
        usuario: defaultUser,
        ...timestamp
      }],
      [{ // POS sem Fio
        produtoId: null,
        inicio: today,
        fim: null,
        tipoCaptura: tiposCaptura.aluguel,
        valor: 75,
        usuario: defaultUser,
        ...timestamp
      }],
      [ // TEF
        {
          produtoId: null,
          inicio: today,
          fim: null,
          tipoCaptura: tiposCaptura.aluguel,
          valor: 60,
          usuario: defaultUser,
          ...timestamp
        },
        {
          produtoId: null,
          inicio: today,
          fim: null,
          tipoCaptura: tiposCaptura.venda,
          valor: 1550,
          usuario: defaultUser,
          ...timestamp
        }
      ],
      [ // Gateway
        {
          produtoId: null,
          inicio: today,
          fim: null,
          tipoCaptura: tiposCaptura.aluguel,
          valor: 500,
          usuario: defaultUser,
          ...timestamp
        }
      ]
    ];

    const inserted = (await queryInterface.bulkInsert('produto', produtos, { returning: true })) as any[];

    const data = capturas.reduce((acc, curr, i) => acc.concat(
      curr.map((c) => {
        c.produtoId = inserted[i].id;
        return c;
      }))
    ,                            []);

    return queryInterface.bulkInsert('captura', data, {});
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('captura', null, {});
    return queryInterface.bulkDelete('produto', null, {});
  }
};
