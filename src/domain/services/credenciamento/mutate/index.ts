import { Sequelize } from 'sequelize-database';
import { FileStorage } from '../../../../infra/fileStorage';

import validateAccreditationService from './validateAccreditationService';
import uploadAccreditationFilesService from './uploadAccreditationFilesService';
import mapAccreditationFromWizardStepsService from './mapAccreditationFromWizardStepsService';
import mapAccreditationFilesService from './mapAccreditationFilesService';
import createAccreditationService from './createAccreditationService';

export interface CredenciamentoMutateServices {
  validateAccreditation?: typeof validateAccreditationService;
  uploadAccreditationFiles?: ReturnType<typeof uploadAccreditationFilesService>;
  mapAccreditationFromWizardSteps?: typeof mapAccreditationFromWizardStepsService;
  mapAccreditationFiles?: typeof mapAccreditationFilesService;
  createAccreditation?: ReturnType<typeof createAccreditationService>;
}

export function getCredenciamentoMutateServices(
  db: Sequelize,
  fileStorage: FileStorage
) {
  const services: CredenciamentoMutateServices = {};

  services.validateAccreditation = validateAccreditationService;
  services.uploadAccreditationFiles = uploadAccreditationFilesService(fileStorage);
  services.mapAccreditationFromWizardSteps = mapAccreditationFromWizardStepsService;
  services.mapAccreditationFiles = mapAccreditationFilesService;
  services.createAccreditation = createAccreditationService(db);

  return services;
}
