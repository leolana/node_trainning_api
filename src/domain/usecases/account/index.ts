import deleteInvite from './deleteInvite';
import resendInvite from './resendInvite';
import recoverPass from './recoverPass';
import createMembershipUseCase from './createMembershipUseCase';
import checkMembershipsUseCase from './checkMembershipsUseCase';
import { Sequelize } from 'sequelize-database';
import { Mailer } from '../../../infra/mailer';
import { Auth } from '../../../infra/auth';

export interface AccountUseCases {
  deleteInvite?: ReturnType<typeof deleteInvite>;
  resendInvite?: ReturnType<typeof resendInvite>;
  recoverPass?: ReturnType<typeof recoverPass>;
  createMembershipUseCase?: ReturnType<typeof createMembershipUseCase>;
  checkMembershipsUseCase?: ReturnType<typeof checkMembershipsUseCase>;
}

export function getAccountUseCases(db: Sequelize, mailer: Mailer, emailTemplates: any, settings: any, auth: Auth) {
  const usecases: AccountUseCases = {};

  usecases.deleteInvite = deleteInvite(db);
  usecases.resendInvite = resendInvite(db, mailer, emailTemplates, settings);
  usecases.recoverPass = recoverPass(db, auth);
  usecases.createMembershipUseCase = createMembershipUseCase(db);
  usecases.checkMembershipsUseCase = checkMembershipsUseCase(db);

  return usecases;
}
