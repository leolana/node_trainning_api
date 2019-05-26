const deleteInvite = require('./deleteInvite.usecase');
const resendInvite = require('./resendInvite.usecase');
const recoverPass = require('./recoverPass.usecase');

module.exports = (db, mailer, emailTemplates, settings, auth) => {
  const usecases = {
    deleteInvite: deleteInvite(db),
    resendInvite: resendInvite(db, mailer, emailTemplates, settings),
    recoverPass: recoverPass(db, auth),
  };
  return usecases;
};
