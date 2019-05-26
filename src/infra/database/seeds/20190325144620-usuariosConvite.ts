import { QueryInterface } from 'sequelize';

import rolesEnum from '../../../domain/services/auth/rolesEnum';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const sequelize = queryInterface.sequelize;

    const now = new Date();
    const timestamp = { createdAt: now, updatedAt: now };

    // const rolesEc = [
    //   rolesEnum.ecAdministrador,
    //   rolesEnum.ecCompras,
    //   rolesEnum.ecFinanceiro
    // ];

    // const rolesFornecedor = [
    //   rolesEnum.fcAdministrador,
    //   rolesEnum.fcComercial,
    //   rolesEnum.fcFinanceiro
    // ];

    const convites = [
      {
        participante: null,
        codigo: '00000000-0000-0000-0000-000000000000',
        nome: 'Marcelo Néias',
        email: 'marcelo@itlab',
        celular: '11922223333',
        roles: [rolesEnum.super],
        convidadoPor: 'alpe@alpe.com.br',
        expiraEm: '2019-01-01',
        ...timestamp
      }
    ];

    const [ecs] = (await Promise.all([
      sequelize.query(
        'SELECT "participanteId" FROM "participanteEstabelecimento" LIMIT 1;',
        { type: sequelize.QueryTypes.SELECT }
      )
    ])) as any[][];

    const ec = ecs[0].participanteId;

    convites.forEach((c) => {
      c.participante = ec;
    });

    return queryInterface.bulkInsert('usuarioConvite', convites, {});
  },

  down: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete('usuarioConvite', null, {});
  }
};
