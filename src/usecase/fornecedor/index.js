const add = require('./add.usecase');
const identifier = require('./identifier.usecase');
const details = require('./details.usecase');
const edit = require('./edit.usecase');
const rejectNomination = require('./rejectNomination.usecase');
const requestCession = require('./requestCession.usecase');
const searchRegistered = require('./searchRegistered.usecase');
const searchCanceled = require('./searchCanceled.usecase');
const searchPending = require('./searchPending.usecase');
const searchIdentifiers = require('./searchIdentifiers.usecase');
const tariffs = require('./tariffs.usecase');
const myEstablishments = require('./myEstablishments.usecase');

module.exports = (
  db,
  siscofWrapper,
  auth,
  mailer,
  mailerSettings,
  fileStorage
) => ({
  add: add(db, siscofWrapper, auth, mailer, mailerSettings, fileStorage),
  identifier: identifier(db),
  details: details(db),
  edit: edit(db, siscofWrapper, auth, fileStorage),
  rejectNomination: rejectNomination(db, mailer),
  requestCession: requestCession(db, siscofWrapper, mailer, mailerSettings),
  searchRegistered: searchRegistered(db),
  searchPending: searchPending(db),
  searchCanceled: searchCanceled(db),
  searchIdentifiers: searchIdentifiers(db),
  tariffs: tariffs(siscofWrapper),
  myEstablishments: myEstablishments(db),
});
