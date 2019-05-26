import { Transaction } from 'sequelize';
import * as Exceptions from '../../../../interfaces/rest/exceptions/ApiExceptions';

/**
 * Atualiza no postgres o (credenciamento) para que o (participanteNovo.id)
 * se torne responsável pelo estabelecimento editado/aprovado.
 *
 * @param credenciamento O objeto da model de credenciamento.
 * @param participanteNovo Objeto da model de participante com dados novos pegos do objeto da model de credenciamento.
 * @param transaction Transação aberta do postgres.
 */
const approveSaveAccreditationService = async (
  credenciamento: any,
  participanteNovo: any,
  transaction: Transaction
) => {

  if (!participanteNovo || !participanteNovo.id) {
    throw new Exceptions.InvalidParticipanteIdException();
  }

  participanteNovo.credenciamento = credenciamento;

  if (credenciamento.participanteId !== participanteNovo.id) {
    credenciamento.participanteId = participanteNovo.id;

    await credenciamento.save({
      transaction
    });
  }

};

export default approveSaveAccreditationService;
