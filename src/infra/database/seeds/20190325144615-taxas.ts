// tslint:disable: no-magic-numbers
import { QueryInterface } from 'sequelize';

import { defaultUser } from '../consts';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const sequelize = queryInterface.sequelize;

    const now = new Date();
    const timestamp = { createdAt: now, updatedAt: now };

    const [bandeiras, faturamentos] = await Promise.all([
      sequelize.query('SELECT id, nome FROM bandeira;', { type: sequelize.QueryTypes.SELECT }),
      sequelize.query('SELECT id FROM "faturamentoCartao";', { type: sequelize.QueryTypes.SELECT })
    ]);

    const taxas = [{
      tipoPessoa: null,
      inicio: '2018-08-01',
      fim: null,
      default: true,
      usuario: defaultUser,
      ...timestamp
    }];

    const taxasInseridas = (await queryInterface.bulkInsert('taxa', taxas, { returning: true })) as any[];

    const aVistaRange = {
      minimo: 1,
      maximo: 1,
      eventoId: 2,
    };
    const doisASeis = {
      minimo: 2,
      maximo: 6,
      eventoId: 3,
    };
    const seteADoze = {
      minimo: 7,
      maximo: 12,
      eventoId: 4,
    };

    const prazos = [
      { prazo: 33, coeficiente: 0 },
      { prazo: 14, coeficiente: 0.8 },
      { prazo: 3, coeficiente: 1.8 },
    ];

    const taxasDebitoBandeira = {
      Mastercard: 2.03,
      Visa: 2.03,
      Elo: 2.43,
      Hipercard: 2.18,
    };

    const taxasAdministrativasBandeiras = {
      Mastercard: [
        { valor: 2.51, ...aVistaRange },
        { valor: 3.18, ...doisASeis },
        { valor: 3.24, ...seteADoze },
      ],
      Visa: [
        { valor: 2.51, ...aVistaRange },
        { valor: 3.18, ...doisASeis },
        { valor: 3.24, ...seteADoze },
      ],
      Elo: [
        { valor: 2.91, ...aVistaRange },
        { valor: 3.34, ...doisASeis },
        { valor: 3.67, ...seteADoze },
      ],
      Hipercard: [
        { valor: 2.66, ...aVistaRange },
        { valor: 3.33, ...doisASeis },
        { valor: 3.39, ...seteADoze },
      ],
    };

    const ranges = [aVistaRange, doisASeis, seteADoze];

    const taxasPrazo = prazos
      .reduce((accumulator, current) => {
        const pr = ranges.map(r => ({
          taxaId: taxasInseridas[0].id,
          prazo: current.prazo,
          coeficiente: current.coeficiente,
          usuario: defaultUser,
          ...r,
          ...timestamp
        }));

        return accumulator.concat(pr);
      },      []);

    const taxasBandeira = bandeiras.map(b => ({
      taxaId: taxasInseridas[0].id,
      taxaDebito: taxasDebitoBandeira[b.nome],
      bandeiraId: b.id,
      usuario: defaultUser,
      ...timestamp
    }));

    const [taxasPrazoInseridas, taxasBandeiraInseridas] = (await Promise.all([
      queryInterface.bulkInsert('taxaPrazo', taxasPrazo, { returning: true }),
      queryInterface.bulkInsert('taxaBandeira', taxasBandeira, { returning: true })
    ])) as any[];

    const taxasAdministrativas = taxasPrazoInseridas.reduce((acc, curr) => {
      return acc.concat(bandeiras.map(b => ({
        taxaPrazoId: curr.id,
        bandeiraId: b.id,
        valorBase: taxasAdministrativasBandeiras[b.nome].find(
          t => t.minimo === curr.minimo && t.maximo === curr.maximo,
        ).valor,
        usuario: defaultUser,
        ...timestamp
      })));
    },                                                      []);

    const taxasFaturamento = taxasBandeiraInseridas.reduce((acc, curr) => {
      return acc.concat(faturamentos.map(f => ({
        taxaBandeiraId: curr.id,
        faturamentoCartaoId: f.id,
        coeficiente: 0,
        usuario: defaultUser,
        ...timestamp
      })));
    },                                                     []);

    return Promise.all([
      queryInterface.bulkInsert('taxaAdministrativa', taxasAdministrativas, {}),
      queryInterface.bulkInsert('taxaFaturamento', taxasFaturamento, {})
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await Promise.all([
      queryInterface.bulkDelete('taxaFaturamento', null, {}),
      queryInterface.bulkDelete('taxaAdministrativa', null, {})
    ]);
    await Promise.all([
      queryInterface.bulkDelete('taxaBandeira', null, {}),
      queryInterface.bulkDelete('taxaPrazo', null, {})
    ]);
    return queryInterface.bulkDelete('taxa', null, {});
  }
};
