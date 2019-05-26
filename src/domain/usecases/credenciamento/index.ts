import { Sequelize } from 'sequelize-database';
import { Auth } from '../../../infra/auth';
import { FileStorage } from '../../../infra/fileStorage';
import { SiscofWrapper } from '../../../infra/siscof';
import { Mailer } from '../../../infra/mailer';
import { LoggerInterface } from '../../../infra/logging';

import addAnalysisFile from './addAnalysisFile';
import approveUseCase from './approveUseCase';
import changeStatus from './changeStatus';
import details from './details';
import editUseCase from './editUseCase';
import fetchFile from './fetchFile';
import fetchReportFile from './fetchReportFile';
import addAccreditationUseCase from './addAccreditationUseCase';
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
import { getCredenciamentoEditUseCases } from './edit';
import { getCredenciamentoApproveUseCases } from './approve';

export interface CredenciamentoUseCases {
  addAnalysisFile?: ReturnType<typeof addAnalysisFile>;
  approve?: ReturnType<typeof approveUseCase>;
  changeStatus?: ReturnType<typeof changeStatus>;
  details?: ReturnType<typeof details>;
  edit?: ReturnType<typeof editUseCase>;
  fetchFile?: ReturnType<typeof fetchFile>;
  fetchReportFile?: ReturnType<typeof fetchReportFile>;
  addAccreditation?: ReturnType<typeof addAccreditationUseCase>;
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
  mailerSettigs: any,
  logger: LoggerInterface
) {
  const usecases: CredenciamentoUseCases = {};
  const services = getCredenciamentoServices(db, siscofWrapper, fileStorage, logger);
  const credenciamentoEditUsecases = getCredenciamentoEditUseCases(db, mailer, mailerSettigs);
  const credenciamentoApproveUsecases = getCredenciamentoApproveUseCases(db, auth);

  usecases.addAnalysisFile = addAnalysisFile(db, fileStorage);
  usecases.approve = approveUseCase(db, credenciamentoApproveUsecases, services);
  usecases.changeStatus = changeStatus(db);
  usecases.details = details(db);
  usecases.edit = editUseCase(db, logger, credenciamentoEditUsecases, services);
  usecases.fetchFile = fetchFile(db, fileStorage);
  usecases.fetchReportFile = fetchReportFile(db, fileStorage);
  usecases.addAccreditation = addAccreditationUseCase(db, services);
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
