import { QueryInterface } from 'sequelize';

import { defaultUser } from '../consts';
import participanteVinculoStatus from '../../../domain/entities/participanteVinculoStatus';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const defaultApprovingDays = 2;

    const now = new Date();
    const timestamp = { createdAt: now, updatedAt: now };

    const vinculos = {
      participanteEstabelecimentoId: 1,
      participanteFornecedorId: 2,
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
    };

    await queryInterface.bulkInsert('participanteVinculo', [vinculos], {});
  },

  down: async (queryInterface: QueryInterface) => {
    await Promise.all([
      queryInterface.bulkDelete('participanteVinculoRecorrente', null, {}),
      queryInterface.bulkDelete('participanteVinculoHistorico', null, {}),
    ]);
    await queryInterface.bulkDelete('participanteVinculo', null, {});
  }
};
