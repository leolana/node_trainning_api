import { Transaction } from 'sequelize';
import { CredenciamentoApproveServices } from './index';

const saveParticipantForApprovalService = (
  credenciamentoApproveServices: CredenciamentoApproveServices
) =>

  /**
   * Caso o participante já exista (participanteExistente) este será atualizado, suas associações
   * excluídas e criadas novamente. Caso o participante não exista este será criado junto de suas associações.
   * Associações: (participanteContato), (participanteTaxa), (participanteSocio), e (participanteDomicilioBancario)
   *
   * @param participanteNovo Objeto da model de participante com dados novos pegos do objeto da model de credenciamento.
   * @param participanteExistente Se for o fluxo de aprovação de um credenciamento em análise então terá valor null.
   * Se for o fluxo da edição de um credenciamento já aprovado então será a model do participante já existente.
   * @param transaction Transação aberta do postgres
   */
  async (
    participanteNovo: any,
    participanteExistente: any,
    transaction: Transaction,
  ) => {

    if (participanteExistente) {
      await credenciamentoApproveServices.updateParticipantForApproval(
        participanteNovo,
        transaction
      );
      return participanteNovo;
    }

    return await credenciamentoApproveServices.createParticipantForApproval(
      participanteNovo,
      transaction
    );

  };

export default saveParticipantForApprovalService;
