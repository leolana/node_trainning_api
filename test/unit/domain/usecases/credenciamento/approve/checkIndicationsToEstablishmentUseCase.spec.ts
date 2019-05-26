// tslint:disable:no-magic-numbers
import database from '../../../../../support/database';
import checkIndicationsToEstablishmentUseCase from '../../../../../../src/domain/usecases/credenciamento/approve/checkIndicationsToEstablishmentUseCase';
import participanteIndicacaoStatus from '../../../../../../src/domain/entities/participanteIndicacaoStatus';
import { vinculoConfig } from '../../../../../../src/domain/services/vinculo/vinculoConfig';
import participanteVinculoStatus from '../../../../../../src/domain/entities/participanteVinculoStatus';

describe('Domain :: UseCases :: Credenciamento :: Approve :: checkIndicationsToEstablishmentUseCase', () => {

  test(
    `
      Should call (indicacao.update) and (participanteVinculo.create) for each
      participanteIndicacao found
    `,
    async (done) => {
      try {

        const participanteId = 1;
        const participanteDocumento = '938.571.460-01';
        const userEmail = 'alpe@alpe.com.br';
        const transaction = null;

        let count = 0;

        const update = async (model: any, config: any) => {
          expect(config).toHaveProperty('transaction');

          expect(model.usuarioResposta).toBe(userEmail);
          expect(model.status).toBe(participanteIndicacaoStatus.aprovado);
          expect(model).toHaveProperty('dataFimIndicacao');

          count += 1;
        };

        const indicacoes = [
          { update, participanteId: 4, usuario: 'fornecedor1@gmail.com' },
          { update, participanteId: 11, usuario: 'fornecedor2@gmail.com' },
          { update, participanteId: 21, usuario: 'fornecedor3@gmail.com' }
        ];

        database.entities.participanteIndicacao.findAll = async (config: any) => {
          expect(config.where.documento).toBe('93857146001');

          expect(config.attributes.indexOf('participanteId')).not.toBe(-1);
          expect(config.attributes.indexOf('usuario')).not.toBe(-1);

          return indicacoes;
        };

        database.entities.participanteVinculo.create = async (model: any, config: any) => {
          expect(config).toHaveProperty('transaction');

          expect(model.participanteEstabelecimentoId).toBe(participanteId);
          expect(model).toHaveProperty('participanteFornecedorId');
          expect(model.usuario).not.toBe(userEmail);
          expect(model.exibeValorDisponivel).toBe(true);
          expect(model.diasAprovacao).toBe(vinculoConfig.defaultApprovingDays);
          expect(model.estabelecimentoSolicitouVinculo).toBe(false);
          expect(model.status).toBe(participanteVinculoStatus.pendente);

          count += 1;
        };

        const checkIndicationsToEstablishment = checkIndicationsToEstablishmentUseCase(
          database
        );

        await checkIndicationsToEstablishment(
          participanteId,
          participanteDocumento,
          userEmail,
          transaction
        );

        expect(count).toBe(2 * indicacoes.length);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

});
