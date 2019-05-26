import { Sequelize } from 'sequelize-database';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import { Auth } from '../../../infra/auth';
import { LoggerInterface } from '../../../infra/logging';

const updateUserStatusUseCase = (
  db: Sequelize,
  auth: Auth,
  logger: LoggerInterface
) => async (userId: string, userStatus: boolean, email: string) => {
  const transaction = await db.transaction();

  try {
    const user = await db.entities.usuario.findOne({ transaction, where: { id: userId } });
    if (!user) {
      throw new Exceptions.UserNotFoundException();
    }

    await user.update({ ativo: userStatus }, { transaction });
    await auth.updateUserStatus(user.id, userStatus);

    await transaction.commit();

    try {
      logger.info(`Status do usuário "${userId}" no Keycloak foi alterado para "${userStatus}" por "${email}".`);
    } catch (e) { }

  } catch (error) {
    transaction.rollback();
    throw error;
  }
};

export default updateUserStatusUseCase;
