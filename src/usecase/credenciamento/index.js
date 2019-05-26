const addAnalysisFile = require('./addAnalysisFile.usecase');
const approve = require('./approve.usecase');
const changeStatus = require('./changeStatus.usecase');
const details = require('./details.usecase');
const edit = require('./edit.usecase');
const fetchFile = require('./fetchFile.usecase');
const add = require('./add.usecase');
const search = require('./search.usecase');
const suggest = require('./suggest.usecase');
const checkDocumentExistence = require('./checkDocumentExistence.usecase');
const canApprove = require('./canApprove.usecase');
const canAnalyze = require('./canAnalyze.usecase');
const canReject = require('./canReject.usecase');

module.exports = (
  db,
  auth,
  fileStorage,
  siscofWrapper,
  mailer,
  mailerSettigs
) => ({
  addAnalysisFile: addAnalysisFile(db, fileStorage),
  approve: approve(db, auth, siscofWrapper),
  changeStatus: changeStatus(db),
  details: details(db),
  edit: edit(db, auth, fileStorage, siscofWrapper, mailer, mailerSettigs),
  fetchFile: fetchFile(db, fileStorage),
  add: add(db, fileStorage),
  search: search(db),
  suggest: suggest(db, fileStorage),
  checkDocumentExistence: checkDocumentExistence(db),
  canApprove: canApprove(db),
  canAnalyze: canAnalyze(db),
  canReject: canReject(db),
});
