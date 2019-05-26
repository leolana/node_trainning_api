import credenciamentoStatusEnum from '../../../entities/credenciamentoStatusEnum';
import * as Exceptions from '../../../../interfaces/rest/exceptions/ApiExceptions';
import deformatDocument from '../../../services/credenciamento/deformatDocument';

/**
 * Estoura custom exceptions quando:
 * 1. O status do credenciamento salvo for diferente de aprovado
 * 2. O documento do credenciamento salvo for diferente do informado, checagem após remover máscaras
 *
 * @param statusCredenciamentoAnterior status do credenciamento salvo
 * @param documentoCredenciamentoAnterior documento do credenciamento salvo
 */
const validateAccreditationBeforeEditUseCase = async (
  statusCredenciamentoAnterior: credenciamentoStatusEnum,
  documentoCredenciamentoAnterior: string,
  documentoRecebidoParaAlteracao: string
) => {

  if (statusCredenciamentoAnterior !== credenciamentoStatusEnum.aprovado) {
    throw new Exceptions.InvalidAccreditationStatusException();
  }

  if (deformatDocument(documentoCredenciamentoAnterior) !== deformatDocument(documentoRecebidoParaAlteracao)) {
    throw new Exceptions.AccreditationDocumentDiferentException();
  }
};

export default validateAccreditationBeforeEditUseCase;
