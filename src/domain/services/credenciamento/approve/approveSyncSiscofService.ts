import { SiscofWrapper } from '../../../../infra/siscof';
import * as Exceptions from '../../../../interfaces/rest/exceptions/ApiExceptions';
import { LoggerInterface } from '../../../../infra/logging';

const approveSyncSiscofService = (
  siscofWrapper: SiscofWrapper,
  logger: LoggerInterface
) => {

  /**
   * Responsável por refletir os dados do novo participante no siscof.
   * Caso haja erro no siscof o fluxo continuará sem estourar erro
   *
   * @param participanteNovo objeto da model do participante com os dados novos
   */
  return async (
    participanteNovo: any
  ) => {

    if (!participanteNovo.id) {
      throw new Exceptions.InvalidParticipanteIdException();
    }

    if (!participanteNovo.documento) {
      throw new Exceptions.MissingDocumentException();
    }

    try {
      participanteNovo.taxaContratual = participanteNovo.credenciamento.taxaContratual;

      await siscofWrapper.incluirParticipante(
        participanteNovo,
        true
      );

    } catch (siscofError) {
      logger.info('Não foi possível incluir o participante no siscof');
      logger.info(participanteNovo);
      logger.error(siscofError);
    }

  };
};

export default approveSyncSiscofService;
