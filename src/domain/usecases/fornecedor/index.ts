import addUseCase from './addUseCase';
import identifier from './identifier';
import details from './details';
import editUsecase from './editUsecase';
import rejectNomination from './rejectNomination';
import requestCessionUseCase from './requestCessionUseCase';
import searchIdentifiers from './searchIdentifiers';
import tariffs from './tariffs';
import myEstablishmentsUseCase from './myEstablishmentsUseCase';
import searchRegisteredUseCase from './searchRegisteredUseCase';
import searchCanceledUseCase from './searchCanceledUseCase';
import searchPendingUseCase from './searchPendingUseCase';

export default (
  db,
  siscofWrapper,
  auth,
  mailer,
  mailerSettings,
  fileStorage,
  logger
) => ({
  add: addUseCase(db, siscofWrapper, auth, mailer, mailerSettings, fileStorage),
  identifier: identifier(db),
  details: details(db),
  edit: editUsecase(db, siscofWrapper, auth, fileStorage),
  rejectNomination: rejectNomination(db, mailer),
  requestCession: requestCessionUseCase(db, siscofWrapper, mailer, mailerSettings, logger),
  searchRegistered: searchRegisteredUseCase(db),
  searchPending: searchPendingUseCase(db),
  searchCanceled: searchCanceledUseCase(db),
  searchIdentifiers: searchIdentifiers(db),
  tariffs: tariffs(siscofWrapper),
  myEstablishments: myEstablishmentsUseCase(db),
});
