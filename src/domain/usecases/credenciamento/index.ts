import { Sequelize } from 'sequelize-database';
import { Auth } from '../../../infra/auth';
import { FileStorage } from '../../../infra/fileStorage';
import { SiscofWrapper } from '../../../infra/siscof';
import { Mailer } from '../../../infra/mailer';

import addAnalysisFile from './addAnalysisFile';
import approveUseCase from './approveUseCase';
import changeStatus from './changeStatus';
import details from './details';
import editUseCase from './editUseCase';
import fetchFile from './fetchFile';
import fetchReportFile from './fetchReportFile';
import add from './add';
import search from './search';
import suggest from './suggest';
import exportCSV from './exportCSV';
import checkDocumentExistenceUseCase from './checkDocumentExistenceUseCase';
import canApproveUseCase from './canApproveUseCase';
import canAnalyzeUseCase from './canAnalyzeUseCase';
import canRejectUseCase from './canRejectUseCase';
import { getCredenciamentoServices } from '../../services/credenciamento';
import editAnalyze from './editAnalyze';
import getIdFromDocumentUseCase from './getIdFromDocumentUseCase';

export interface CredenciamentoUseCases {
  addAnalysisFile?: ReturnType<typeof addAnalysisFile>;
  approve?: ReturnType<typeof approveUseCase>;
  changeStatus?: ReturnType<typeof changeStatus>;
  details?: ReturnType<typeof details>;
  edit?: ReturnType<typeof editUseCase>;
  fetchFile?: ReturnType<typeof fetchFile>;
  fetchReportFile?: ReturnType<typeof fetchReportFile>;
  add?: ReturnType<typeof add>;
  search?: ReturnType<typeof search>;
  suggest?: ReturnType<typeof suggest>;
  exportCSV?: ReturnType<typeof exportCSV>;
  checkDocumentExistence?: ReturnType<typeof checkDocumentExistenceUseCase>;
  canApprove?: ReturnType<typeof canApproveUseCase>;
  canAnalyze?: ReturnType<typeof canAnalyzeUseCase>;
  canReject?: ReturnType<typeof canRejectUseCase>;
  editAnalyze?: ReturnType<typeof editAnalyze>;
  getIdFromDocument?: ReturnType<typeof getIdFromDocumentUseCase>;
}

export function getCredenciamentoUseCases(
  db: Sequelize,
  auth: Auth,
  fileStorage: FileStorage,
  siscofWrapper: SiscofWrapper,
  mailer: Mailer,
  mailerSettigs: any
) {
  const usecases: CredenciamentoUseCases = {};
  const services = getCredenciamentoServices(db, siscofWrapper, fileStorage);

  usecases.addAnalysisFile = addAnalysisFile(db, fileStorage);
  usecases.approve = approveUseCase(db, auth, services);
  usecases.changeStatus = changeStatus(db);
  usecases.details = details(db);
  usecases.edit = editUseCase(db, mailer, mailerSettigs, services);
  usecases.fetchFile = fetchFile(db, fileStorage);
  usecases.fetchReportFile = fetchReportFile(db, fileStorage);
  usecases.add = add(db, fileStorage);
  usecases.search = search(db);
  usecases.suggest = suggest(db, fileStorage);
  usecases.exportCSV = exportCSV(db);
  usecases.checkDocumentExistence = checkDocumentExistenceUseCase(db);
  usecases.canApprove = canApproveUseCase(db);
  usecases.canAnalyze = canAnalyzeUseCase(db);
  usecases.canReject = canRejectUseCase(db);
  usecases.editAnalyze = editAnalyze(db, fileStorage);
  usecases.getIdFromDocument = getIdFromDocumentUseCase(db);

  return usecases;
}
