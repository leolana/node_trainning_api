import { Sequelize } from 'sequelize-database';

import { CredenciamentoServices } from '../../services/credenciamento';
import { CredenciamentoApproveUseCases } from './approve';

const approveUseCase = (
  db: Sequelize,
  credenciamentoApproveUsecases: CredenciamentoApproveUseCases,
  credenciamentoServices: CredenciamentoServices
) =>

  /**
   * Fluxo de aprovação de um credenciamento em análise.
   *
   * 1. Encontra o (credenciamento) que está sendo aprovado pelo (credenciamentoId).
   * 2. Aprova o credenciamento criando o participante estabelecimento e vinculando ele ao credenciamento.
   * 3. Aceita os termos de aprovação.
   * 4. Cria os vínculos com status de pendente para os fornecedores que o indicaram.
   *
   * @param credenciamentoId O id para localizar o credenciamento no postgres.
   * @param userEmail O email do usuário responsável pela aprovação do credenciamento.
   */
  async (
    credenciamentoId: number,
    userEmail: string
  ) => {

    const credenciamento = await credenciamentoServices.findService(
      credenciamentoId
    );

    const transaction = await db.transaction();

    try {
      const participanteNovo = await credenciamentoServices.approveService(
        credenciamento,
        null,
        userEmail,
        transaction
      );

      await credenciamentoApproveUsecases.acceptTermOnApprove(
        participanteNovo.id,
        userEmail,
        transaction
      );

      await credenciamentoApproveUsecases.checkIndicationsToEstablishment(
        participanteNovo.id,
        participanteNovo.documento,
        userEmail,
        transaction
      );

      transaction.commit();

    } catch (error) {
      transaction.rollback();
      throw error;
    }

    return credenciamento;
  };

export default approveUseCase;
