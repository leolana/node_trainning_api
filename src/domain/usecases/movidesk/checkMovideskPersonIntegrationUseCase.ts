import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import deformatDocument from '../../services/credenciamento/deformatDocument';
import { PersonAPI } from '../../../infra/movidesk';
import { LoggerInterface } from '../../../infra/logging';
import { MovideskPerson } from '../../../infra/movidesk/PersonTypes';

const checkMovideskPersonIntegrationUseCase = (
  personApi: PersonAPI,
  logger: LoggerInterface
) =>

  /**
   * Pesquisa o (participanteId) no Movidesk, se o cadastro for encontrado:
   * 1. Estoura custom exception se o (cpfCnpj) for diferente de (participanteDocumento).
   * 2. Retorna o objeto (person) cadastrado.
   *
   * Se o cadastro não for encontrado, pesquisa o (userName) no Movidesk:
   * 1. Estoura custom exception se encontrar.
   * 2. Retorna (null) se não encontrar.
   *
   * @param documento CPF ou CNPJ do Participante.
   * @param participanteId Id do Participante.
   */
  async (
    participanteId: number,
    participanteDocumento: string
  ) => {

    if (!participanteId || isNaN(participanteId)) {
      throw new Exceptions.InvalidParticipanteIdException();
    }

    const documento = deformatDocument(participanteDocumento);
    if (!documento) {
      throw new Exceptions.MissingDocumentException();
    }

    let people: MovideskPerson[] = null;

    people = await personApi.list([{
      field: 'codeReferenceAdditional',
      op: 'eq',
      value: participanteId
    }]);

    if (people && people.length) {
      const person = people.find(p => p.cpfCnpj === documento);
      if (!person) {
        throw new Exceptions.MovideskDocumentMismatchException();
      }

      logger.info(`Participant (Id "${participanteId}", Document "${documento}") found in Movidesk.`);
      return person;
    }

    people = await personApi.list([{
      field: 'userName',
      op: 'eq',
      value: documento
    }]);

    if (people && people.length) {
      throw new Exceptions.MovideskUsernameExistsToOtherParticipantIdException();
    }

    logger.info(`Participant (Id "${participanteId}", Document "${documento}") NOT found in Movidesk.`);
    return null;
  };

export default checkMovideskPersonIntegrationUseCase;
