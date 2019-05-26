import { CredenciamentoServices } from './index';
import { CredenciamentoApproveServices } from './approve';
import { Transaction } from 'sequelize';

const approveService = (
  credenciamentoServices: CredenciamentoServices,
  credenciamentoApproveServices: CredenciamentoApproveServices
) =>

  /**
   * Valida o status do (credenciamento) para aprovação. Edita o (participanteExistente) ou cria um
   * participante do tipo estabelecimento usando o credenciamento. Cria as associações do participante.
   * Faz a aprovação criando o registro (credenciamentoAprovacao). Inativa credenciamentos duplicados.
   * Mantem registro se os dados do participante no siscof estão sincronizados. Retorna a model atualizada
   * do participante vinculado ao credenciamento.
   *
   * @param credenciamento O objeto da model de credenciamento.
   * @param participanteExistente Se for o fluxo de aprovação de um credenciamento em análise então terá valor null.
   * Se for o fluxo da edição de um credenciamento já aprovado então será a model do participante já existente.
   * @param userEmail O email do usuário responsável pela aprovação.
   * @param transaction Transação aberta do postgres.
   */
  async (
    credenciamento: any,
    participanteExistente: any,
    userEmail: string,
    transaction: Transaction
  ) => {

    await credenciamentoApproveServices.validateCredenciamentoBeforeApproval(
      credenciamento,
      participanteExistente
    );

    let participanteNovo = await credenciamentoApproveServices.getParticipantFromAccreditationDataForApproval(
      credenciamento,
      userEmail
    );

    await credenciamentoApproveServices.getParticipantIdForApproval(
      participanteExistente,
      participanteNovo
    );

    participanteNovo = await credenciamentoApproveServices.saveParticipantForApproval(
      participanteNovo,
      participanteExistente,
      transaction
    );

    await credenciamentoApproveServices.createAccreditationApproval(
      credenciamento.id,
      participanteExistente,
      transaction,
      userEmail
    );

    await credenciamentoApproveServices.approveSaveAccreditation(
      credenciamento,
      participanteNovo,
      transaction
    );

    await credenciamentoApproveServices.approveCreateEstablishment(
      participanteNovo,
      participanteExistente,
      transaction
    );

    await credenciamentoServices.inactivateDuplicatesService(
      credenciamento.id,
      credenciamento.documento,
      transaction
    );

    await credenciamentoApproveServices.approveSyncSiscof(
      participanteNovo
    );

    return participanteNovo;
  };

export default approveService;
