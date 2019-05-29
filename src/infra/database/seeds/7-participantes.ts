// tslint:disable: no-magic-numbers
import { QueryInterface } from 'sequelize';

import tiposPessoa from '../../../domain/entities/tiposPessoa';
import rateTypeEnum from '../../../domain/services/types/rateTypeEnum';

module.exports = {
  up: async (queryInterface: QueryInterface) => {

    const now = new Date();
    const timestamp = { createdAt: now, updatedAt: now };

    const participantesEstabelecimento = {
      tipoPessoa: tiposPessoa.juridica,
      documento: '01510345000158',
      nome: 'It Lab - Estabelecimento',
      ativo: true,
      ...timestamp
    };
    const participanteFornecedor = {
      tipoPessoa: tiposPessoa.juridica,
      documento: '32608796000156',
      nome: 'KG Menswear - Fornecedor',
      ativo: true,
    };

    await queryInterface.bulkInsert('participante', [participantesEstabelecimento]);
    await queryInterface.bulkInsert('participante', [participanteFornecedor]);

    const taxa = [
      {
        valorInicio: 0,
        valorFim: 10000,
        taxa: 1.8,
        participanteId: 2,
        usuarioCriacao: 'admin',
        participanteTaxaTipo: rateTypeEnum.cessao
      }
    ];
    await queryInterface.bulkInsert('participanteTaxa', [taxa]);

  },

  down: async (queryInterface: QueryInterface) => {
    await Promise.all([
      queryInterface.bulkDelete('participanteTaxa', null, {}),
      queryInterface.bulkDelete('participanteTaxaHistorico', null, {}),
    ]);
    return queryInterface.bulkDelete('participante', null, {});
  }
};
