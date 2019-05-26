import listUsersUseCase from './listUsersUseCase';
import listInvitesUseCase from './listInvitesUseCase';
import listUsersFromParticipantUseCase from './listUsersFromParticipantUseCase';
import listInvitesFromParticipantUseCase from './listInvitesFromParticipantUseCase';
import { Sequelize } from 'sequelize-database';
import inviteUserUseCase from './inviteUserUseCase';
import { Auth } from '../../../infra/auth';
import { AccountUseCases } from '../account';
import newUserFromInviteUseCase from './newUserFromInviteUseCase';
import updateUserStatusUseCase from './updateUserStatusUseCase';
import validateKeycloakUserStatusUseCase from './validateKeycloakUserStatusUseCase';
import { LoggerInterface } from '../../../infra/logging';

export interface UsuarioUseCases {
  listUsersUseCase?: ReturnType<typeof listUsersUseCase>;
  listInvitesUseCase?: ReturnType<typeof listInvitesUseCase>;
  listUsersFromParticipantUseCase?: ReturnType<typeof listUsersFromParticipantUseCase>;
  listInvitesFromParticipantUseCase?: ReturnType<typeof listInvitesFromParticipantUseCase>;
  inviteUserUseCase?: ReturnType<typeof inviteUserUseCase>;
  newUserFromInviteUseCase?: ReturnType<typeof newUserFromInviteUseCase>;
  updateUserStatusUseCase?: ReturnType<typeof updateUserStatusUseCase>;
  validateKeycloakUserStatusUseCase?: ReturnType<typeof validateKeycloakUserStatusUseCase>;
}

export function getUsuarioUseCases(
  db: Sequelize,
  auth: Auth,
  accountUseCases: AccountUseCases,
  logger: LoggerInterface
) {
  const usecases: UsuarioUseCases = {};

  usecases.listUsersUseCase = listUsersUseCase(db);
  usecases.listInvitesUseCase = listInvitesUseCase(db);
  usecases.listUsersFromParticipantUseCase = listUsersFromParticipantUseCase(db);
  usecases.listInvitesFromParticipantUseCase = listInvitesFromParticipantUseCase(db);
  usecases.inviteUserUseCase = inviteUserUseCase(db, auth, accountUseCases);
  usecases.newUserFromInviteUseCase = newUserFromInviteUseCase(db, auth);
  usecases.updateUserStatusUseCase = updateUserStatusUseCase(db, auth, logger);
  usecases.validateKeycloakUserStatusUseCase = validateKeycloakUserStatusUseCase(db, auth);

  return usecases;
}
