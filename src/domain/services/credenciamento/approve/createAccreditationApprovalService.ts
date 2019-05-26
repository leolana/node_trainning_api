import { Sequelize } from 'sequelize-database';
import { Transaction } from 'sequelize';
import credenciamentoStatusEnum from '../../../entities/credenciamentoStatusEnum';

const createAccreditationApprovalService = (
  db: Sequelize
) =>

  /**
   * Cria a evidência em (credenciamentoAprovacao) de que o
   * credenciamento (accreditationId) foi aprovado por (userEmail).
   *
   * @param accreditationId O id do credenciamento sendo aprovado.
   * @param participanteExistente Se for o fluxo de aprovação de um credenciamento em análise então terá valor null.
   * Se for o fluxo da edição de um credenciamento já aprovado então será a model do participante já existente.
   * @param transaction Transação aberta do postgres.
   * @param userEmail O email do usuário responsável pela aprovação.
   */
  async (
    accreditationId: number,
    participanteExistente: any,
    transaction: Transaction,
    userEmail: string
  ) => {

    const aprovacao = {
      credenciamentoId: accreditationId,
      status: credenciamentoStatusEnum.aprovado,
      usuario: userEmail,
      observacao: participanteExistente ? 'editado' : 'aprovado',
    };

    await db.entities.credenciamentoAprovacao.create(aprovacao, { transaction });

  };

export default createAccreditationApprovalService;
