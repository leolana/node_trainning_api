import { InviteNotFoundException } from '../../../interfaces/rest/exceptions/ApiExceptions';
import { Sequelize } from 'sequelize-database';

const deleteInvite = (db: Sequelize) => (inviteId: string, transaction: any) => {
  const find = () => db.entities.usuarioConvite.findOne({
    transaction,
    where: { codigo: inviteId }
  });

  const validateDestroy = (invite: any) => {
    if (!invite) {
      throw new InviteNotFoundException();
    }
    return invite.destroy({ transaction });
  };

  return find().then(validateDestroy);
};

export default deleteInvite;
