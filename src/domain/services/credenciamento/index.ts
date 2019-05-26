import { Sequelize } from 'sequelize-database';
import { SiscofWrapper } from '../../../infra/siscof';
import { FileStorage } from '../../../infra/fileStorage';
import { LoggerInterface } from '../../../infra/logging';

import applyFiles from './applyFiles';
import approveService from './approveService';
import deformatDocument from './deformatDocument';
import fetchAccreditationFile from './fetchAccreditationFile';
import fetchSuggestionFile from './fetchSuggestionFile';
import findService from './findService';
import mutateService from './mutateService';
import inactivateDuplicatesService from './inactivateDuplicatesService';
import { getCredenciamentoMutateServices } from './mutate';
import { getCredenciamentoApproveServices } from './approve';

export interface CredenciamentoServices {
  applyFiles?: typeof applyFiles;
  deformatDocument?: typeof deformatDocument;
  approveService?: ReturnType<typeof approveService>;
  fetchAccreditationFile?: ReturnType<typeof fetchAccreditationFile>;
  fetchSuggestionFile?: ReturnType<typeof fetchSuggestionFile>;
  findService?: ReturnType<typeof findService>;
  mutateService?: ReturnType<typeof mutateService>;
  inactivateDuplicatesService?: ReturnType<typeof inactivateDuplicatesService>;
}

export function getCredenciamentoServices(
  db: Sequelize,
  siscofWrapper: SiscofWrapper,
  fileStorage: FileStorage,
  logger: LoggerInterface
) {
  const services: CredenciamentoServices = {};
  const credenciamentoMutateServices = getCredenciamentoMutateServices(db, fileStorage);
  const credenciamentoApproveServices = getCredenciamentoApproveServices(db, siscofWrapper, logger);

  services.applyFiles = applyFiles;
  services.deformatDocument = deformatDocument;
  services.approveService = approveService(services, credenciamentoApproveServices);
  services.fetchAccreditationFile = fetchAccreditationFile(db, fileStorage);
  services.fetchSuggestionFile = fetchSuggestionFile(db, fileStorage);
  services.findService = findService(db);
  services.mutateService = mutateService(credenciamentoMutateServices);
  services.inactivateDuplicatesService = inactivateDuplicatesService(db);

  return services;
}
