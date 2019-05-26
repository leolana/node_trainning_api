import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import { Sequelize } from 'sequelize-database';
import { Auth } from '../../../infra/auth';
import { AccountUseCases } from '../account';

const inviteUserUseCase = (
  db: Sequelize,
  auth: Auth,
  accountUseCases: AccountUseCases
) => (nome: string, email: string, celular: string, roles: any[], participanteId: number, convidadoPor: string) => {

  const findUserByEmail = () => {
    return db.entities.usuario.findOne({
      where: { email }
    });
  };

  const findInviteByEmail = () => {
    return db.entities.usuarioConvite.findOne({
      where: { email }
    });
  };

  const findByEmail = () => Promise.all([
    findInviteByEmail(),
    findUserByEmail()
  ]);

  const preCheck = ([invite, user], transaction): any => {
    if (user) {
      throw new Exceptions.UserAlreadyExistsException();
    }
    if (invite && invite.expiraEm >= new Date()) {
      throw new Exceptions.InviteAlreadyExistsException();
    }
    if (invite) {
      return accountUseCases.deleteInvite(invite.codigo, transaction);
    }
  };

  const inviteUser = (transaction: any) => {
    const user = {
      nome,
      email,
      celular,
      roles,
      convidadoPor,
      participante: participanteId
    };

    return auth.inviteUser(user, transaction);
  };

  return db.transaction().then(transaction =>
    findByEmail()
      .then(arr => preCheck(arr, transaction))
      .then(() => inviteUser(transaction))
      .then(() => transaction.commit())
      .catch(e => transaction.rollback().then(() => { throw e; }))
  ).then(() => true);
};

export default inviteUserUseCase;
