import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import { Sequelize } from 'sequelize-database';
import { Auth } from '../../../infra/auth';

const newUserFromInviteUseCase = (
  db: Sequelize,
  auth: Auth
) => (codigo: string, email: string, password: string, participantRoles: any[]) => {

  const findUserByEmail = () => {
    return db.entities.usuario.findOne({
      where: { email }
    });
  };

  const findEmail = () => Promise.all([
    db.entities.usuarioConvite.findOne({
      where: {
        codigo,
        email,
        expiraEm: { $gte: new Date() }
      }
    }),
    findUserByEmail()
  ]);

  const preCheck = ([invite, user]) => {
    if (!invite) {
      throw new Exceptions.InviteNotFoundException();
    }
    if (user) {
      throw new Exceptions.UserAlreadyExistsException();
    }
    return invite;
  };

  const inviteBecomesUser = (invite) => {
    return auth
      .createUser({
        password,
        username: invite.email,
        email: invite.email,
        name: invite.nome,
        roles: invite.roles
      })
      .then(id => db.entities.usuario.create({
        id,
        nome: invite.nome,
        email: invite.email,
        celular: invite.celular,
        roles: invite.roles
      }))
      .then((newUser): any => {
        if (invite.roles.some(role => participantRoles.includes(role))) {
          return db.entities.membro.create({
            usuarioId: newUser.id,
            participanteId: invite.participante
          });
        }
      })
      .then(() => invite.destroy());
  };

  return findEmail()
    .then(preCheck)
    .then(inviteBecomesUser)
    .then(() => true);
};

export default newUserFromInviteUseCase;
