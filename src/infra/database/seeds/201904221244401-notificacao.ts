import { QueryInterface } from 'sequelize';
import usuarioNotificacaoEnum from '../../../domain/services/notificacoes/usuarioNotificacaoEnum';
import { DateTime } from 'luxon';
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const now = new Date();
    const timestamp = { createdAt: now, updatedAt: now };
    const sequelize = queryInterface.sequelize;

    const notificacaoesCategorias = [
      {
        ativo: true,
        categoria: 'Movidesk',
        ...timestamp
      }
    ];

    const categoriesInserted = (await queryInterface
      .bulkInsert('notificacaoCategoria', notificacaoesCategorias, { returning: true })) as any[];

    const notificacao = [
      {
        categoriaId: categoriesInserted[0].id,
        criadorId: null,
        mensagem: 'Estabelecimento It Lab (n° 1 / CNPJ:01510345000158) Integrou-se',
        dataExpiracao: DateTime.local().plus({ days: 5 }).toSQL(),
        ...timestamp
      },
    ];

    const notificationsInserted = (await queryInterface
      .bulkInsert('notificacao', notificacao, { returning: true })) as any[];

    const usuario = (await sequelize.query('SELECT id FROM usuario LIMIT 1;', { type: sequelize.QueryTypes.SELECT }));

    const usuarioNotificacao = [{
      notificacaoId: notificationsInserted[0].id,
      usuarioId: usuario[0].id,
      status: usuarioNotificacaoEnum.naoLido,
      ...timestamp
    }];

    return queryInterface.bulkInsert('usuarioNotificacao', usuarioNotificacao, {});
  },
  down: async (queryInterface: QueryInterface) => {
    return Promise.all([queryInterface.bulkDelete('usuarioNotificacao', null, {}),
      queryInterface.bulkDelete('notificacao', null, {}),
      queryInterface.bulkDelete('notificacaoCategoria', null, {})]);
  },
};
