import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import { Sequelize } from 'sequelize-database';
import { Auth } from '../../../infra/auth';
import { LoggerInterface } from '../../../infra/logging';

const recreateUserKeycloakUseCase = (
  db: Sequelize,
  auth: Auth,
  logger: LoggerInterface,
) => async (userData, emailLogged) => {
  const transaction = await db.transaction();

  try {

    const user = await db.entities.usuario.findOne({ where: { email: userData.email, id: userData.id } });

    if (!user) {
      throw new Exceptions.UserNotFoundException();
    }
    const userKeycloak = {
      id: user.id,
      username: user.email,
      email: user.email,
      name: user.nome,
      roles: user.roles
    };

    const idNewUser = await auth.recreateUser(userKeycloak);

    await db.entities.usuario.update({ id: idNewUser }, {
      transaction,
      where: { email: user.email, id: user.id }
    });

    await transaction.commit();

    try {
      logger.info(`${emailLogged} recriou o usuário ${user.email}" `
        + `"${user.id}" no keycloak, seu novo id é "${idNewUser}" `);
    } catch (e) { }

  } catch (e) {
    transaction.rollback();
    throw e;
  }
};
export default recreateUserKeycloakUseCase;
