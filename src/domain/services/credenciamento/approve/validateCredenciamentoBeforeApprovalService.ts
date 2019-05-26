import * as Exceptions from '../../../../interfaces/rest/exceptions/ApiExceptions';
import credenciamentoStatusEnum from '../../../entities/credenciamentoStatusEnum';

/**
 * Valida o status da model de credenciamento para poder posseguir com a aprovação
 *
 * @param credenciamento objeto da model do credenciamento que será aprovado
 * @param participanteExistente Se for o fluxo de aprovação de um credenciamento em análise então terá valor null.
 * Se for o fluxo após a edição de um credenciamento já aprovado então será a model do participante já existente.
 */
const validateCredenciamentoBeforeApprovalService = async (
  credenciamento: any,
  participanteExistente: any
) => {

  if (!credenciamento) {
    throw new Exceptions.AccreditationNotFoundException();
  }

  if (participanteExistente) {
    if (credenciamento.status !== credenciamentoStatusEnum.aprovado) {
      throw new Exceptions.InvalidAccreditationStatusException();
    }
  } else {
    if (credenciamento.status !== credenciamentoStatusEnum.emAnalise) {
      throw new Exceptions.InvalidAccreditationStatusException();
    }
  }

  credenciamento.status = credenciamentoStatusEnum.aprovado;
};

export default validateCredenciamentoBeforeApprovalService;
