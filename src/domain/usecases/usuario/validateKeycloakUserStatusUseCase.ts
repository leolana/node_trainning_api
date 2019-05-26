import { Sequelize } from 'sequelize-database';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import { Auth } from '../../../infra/auth';

const validateKeycloakUserStatusUseCase = (
  db: Sequelize,
  auth: Auth
) => async (userId: string): Promise<{ userStatus: boolean }> => {

  const user = await db.entities.usuario.findOne({ where: { id: userId } });
  if (!user) {
    throw new Exceptions.UserNotFoundException();
  }

  const keycloakUser = await auth.getUser(userId);
  if (!keycloakUser) {
    throw new Exceptions.KeycloakUserNotFoundException();
  }

  if (user.ativo !== keycloakUser.enabled) {
    keycloakUser.enabled = user.ativo;
    await auth.putUser(keycloakUser);
  }

  return { userStatus: user.ativo };
};

export default validateKeycloakUserStatusUseCase;
