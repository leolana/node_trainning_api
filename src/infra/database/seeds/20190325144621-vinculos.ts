import { QueryInterface } from 'sequelize';

import { defaultUser } from '../consts';
import participanteVinculoStatus from '../../../domain/entities/participanteVinculoStatus';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const sequelize = queryInterface.sequelize;
    const defaultApprovingDays = 2;

    const now = new Date();
    const timestamp = { createdAt: now, updatedAt: now };

    const [ecs, fornecedores] = (await Promise.all([
      sequelize.query(
        'SELECT "participanteId" FROM "participanteEstabelecimento";',
        { type: sequelize.QueryTypes.SELECT }
      ),
      sequelize.query(
        'SELECT "participanteId" FROM "participanteFornecedor";',
        { type: sequelize.QueryTypes.SELECT }
      )
    ])) as any[][];

    const vinculos = [];

    fornecedores.forEach((f) => {
      ecs.forEach((e) => {
        vinculos.push({
          participanteEstabelecimentoId: e.participanteId,
          participanteFornecedorId: f.participanteId,
          usuario: defaultUser,
          status: participanteVinculoStatus.aprovado,
          exibeValorDisponivel: true,
          diasAprovacao: defaultApprovingDays,
          dataRespostaEstabelecimento: now,
          usuarioRespostaEstabelecimento: defaultUser,
          estabelecimentoSolicitouVinculo: true,
          valorMaximoExibicao: null,
          motivoTipoRecusaId: null,
          motivoRecusaObservacao: null,
          ...timestamp
        });
      });
    });

    return queryInterface.bulkInsert('participanteVinculo', vinculos, {});
  },

  down: async (queryInterface: QueryInterface) => {
    await Promise.all([
      queryInterface.bulkDelete('participanteVinculoRecorrente', null, {}),
      queryInterface.bulkDelete('participanteVinculoHistorico', null, {}),
    ]);
    return queryInterface.bulkDelete('participanteVinculo', null, {});
  }
};
