import deleteInvite from './deleteInvite';
import resendInvite from './resendInvite';
import recoverPass from './recoverPass';
import { Sequelize } from 'sequelize-database';
import { Mailer } from '../../../infra/mailer';
import { Auth } from '../../../infra/auth';

export interface AccountUseCases {
  deleteInvite?: ReturnType<typeof deleteInvite>;
  resendInvite?: ReturnType<typeof resendInvite>;
  recoverPass?: ReturnType<typeof recoverPass>;
}

export function getAccountUseCases(db: Sequelize, mailer: Mailer, emailTemplates: any, settings: any, auth: Auth) {
  const usecases: AccountUseCases = {};

  usecases.deleteInvite = deleteInvite(db);
  usecases.resendInvite = resendInvite(db, mailer, emailTemplates, settings);
  usecases.recoverPass = recoverPass(db, auth);

  return usecases;
}
