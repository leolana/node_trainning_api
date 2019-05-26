import { PersonAPI } from '../../../infra/movidesk';
import { MovideskUseCases } from './index';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';

const sendParticipantToMovideskUseCase = (
  movideskUseCases: MovideskUseCases,
  personApi: PersonAPI
) =>

  /**
   * Mapeia os dados para envio, e envia para cadastro no Movidesk.
   * Estoura uma custom exception caso não tenha resultado do Movidesk.
   *
   * @param participante A model do postgres do (participante) contendo as associações (cidade) e (contatos)
   * @param userEmail Email do usuário responsável pela criação da model MovideskPerson
   */
  async (
    participante: any,
    userEmail: string
  ) => {
    const movideskPersonData = await movideskUseCases.mapMovideskPersonDataFromParticipante(
      participante,
      userEmail
    );

    const created = await personApi.create(
      movideskPersonData
    );

    if (!created) {
      throw new Exceptions.EmptyResultFromMovideskException();
    }

    return movideskPersonData;
  };

export default sendParticipantToMovideskUseCase;
