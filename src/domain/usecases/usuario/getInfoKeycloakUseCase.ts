import { Auth } from '../../../infra/auth';
import { LoggerInterface } from '../../../infra/logging';

const getInfoKeycloakUseCase = (auth: Auth, logger: LoggerInterface) => async (idUser) => {

  try {
    return await auth.getInfoUser(idUser);
  } catch (e) {
    logger.error(e);
    throw e;
  }
};
export default getInfoKeycloakUseCase;
