import { QueryInterface } from 'sequelize';

import rolesEnum from '../../../domain/services/auth/rolesEnum';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const sequelize = queryInterface.sequelize;

    const now = new Date();
    const timestamp = { createdAt: now, updatedAt: now };

    const rolesEc = [
      rolesEnum.ecAdministrador,
      rolesEnum.ecCompras,
      rolesEnum.ecFinanceiro
    ];

    const rolesFornecedor = [
      rolesEnum.fcAdministrador,
      rolesEnum.fcComercial,
      rolesEnum.fcFinanceiro
    ];

    const usuarios = [
      {
        id: '8a799af7-22f9-417d-9602-c49c80ce5a23',
        nome: 'Alpe',
        email: 'alpe@alpe.com.br',
        celular: '11988887777',
        roles: [rolesEnum.boAdministrador],
        ...timestamp
      },
      {
        id: '0b6c801e-a330-48dc-9ccd-53998624ded3',
        nome: 'EC',
        email: 'ec@alpe.com.br',
        celular: '11988887777',
        roles: [rolesEnum.ecAdministrador],
        ...timestamp
      },
      {
        id: '5af6002e-1e1d-41f1-92a2-df41b266e0f4',
        nome: 'Fornecedor',
        email: 'fornecedor@alpe.com.br',
        celular: '11988887777',
        roles: [rolesEnum.fcAdministrador],
        ...timestamp
      }
    ];

    const membros = [
      [ // Usuário 1

      ],
      [ // Usuário 2
        {
          usuarioId: null,
          participanteId: null,
          ...timestamp
        }
      ],
      [ // Usuário 3
        {
          usuarioId: null,
          participanteId: null,
          ...timestamp
        }
      ]
    ];

    const [ecs, fornecedores] = (await Promise.all([
      sequelize.query(
        'SELECT "participanteId" FROM "participanteEstabelecimento" LIMIT 1;',
        { type: sequelize.QueryTypes.SELECT }
      ),
      sequelize.query(
        'SELECT "participanteId" FROM "participanteFornecedor" LIMIT 1;',
        { type: sequelize.QueryTypes.SELECT }
      ),
    ])) as any[][];

    const ec = ecs[0].participanteId;
    const fornecedor = fornecedores[0].participanteId;

    const inserted = (await queryInterface.bulkInsert('usuario', usuarios, { returning: true }));

    const dataMembros = membros.reduce((acc, curr, i) => {
      return acc.concat(curr.map((m) => {
        if (usuarios[i].roles.some(r => rolesEc.includes(r))) {
          m.participanteId = ec;
        }

        if (usuarios[i].roles.some(r => rolesFornecedor.includes(r))) {
          m.participanteId = fornecedor;
        }

        m.usuarioId = inserted[i].id;
        return m;
      }));
    },                                 []);

    return queryInterface.bulkInsert('membro', dataMembros, {});
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('membro', null, {});
    return queryInterface.bulkDelete('usuario', null, {});
  }
};
