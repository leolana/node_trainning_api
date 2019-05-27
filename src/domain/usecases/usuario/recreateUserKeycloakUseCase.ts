import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import { Sequelize } from 'sequelize-database';
import { Auth } from '../../../infra/auth';
import { LoggerInterface } from '../../../infra/logging';

const recreateUserKeycloakUseCase = (
  db: Sequelize,
  auth: Auth,
  logger: LoggerInterface,
) => async (userData, emailLogged) => {

  const user = await db.entities.usuario.findOne({
    where: {
      email: userData.email,
      id: userData.id
    }
  });

  if (!user) {
    throw new Exceptions.UserNotFoundException();
  }

  const oldId = user.id;
  const newId = await auth.recreateUser({
    id: userData.userNewKeycloak ? null : oldId,
    username: user.email,
    email: user.email,
    name: user.nome,
    roles: user.roles,
    status: userData.status
  });

  await db.entities.usuario.update(
    { id: newId },
    { where: { id: oldId } }
  );

  logger.info(`"${emailLogged}" recriou o usuário ${user.email}" no keycloak com id "${newId}", antigo id "${oldId}".`);

};
export default recreateUserKeycloakUseCase;
