import { Sequelize } from 'sequelize-database';
import { SiscofWrapper } from '../../../../infra/siscof';
import { LoggerInterface } from '../../../../infra/logging';

import validateCredenciamentoBeforeApprovalService from './validateCredenciamentoBeforeApprovalService';
import getParticipantFromAccreditationDataForApprovalService from './getParticipantFromAccreditationDataForApprovalService';
import getParticipantIdForApprovalService from './getParticipantIdForApprovalService';
import updateParticipantForApprovalService from './updateParticipantForApprovalService';
import createParticipantForApprovalService from './createParticipantForApprovalService';
import saveParticipantForApprovalService from './saveParticipantForApprovalService';
import createAccreditationApprovalService from './createAccreditationApprovalService';
import approveSaveAccreditationService from './approveSaveAccreditationService';
import approveCreateEstablishmentService from './approveCreateEstablishmentService';
import approveSyncSiscofService from './approveSyncSiscofService';

export interface CredenciamentoApproveServices {
  validateCredenciamentoBeforeApproval?: typeof validateCredenciamentoBeforeApprovalService;
  getParticipantFromAccreditationDataForApproval?: typeof getParticipantFromAccreditationDataForApprovalService;
  getParticipantIdForApproval?: ReturnType<typeof getParticipantIdForApprovalService>;
  updateParticipantForApproval?: ReturnType<typeof updateParticipantForApprovalService>;
  createParticipantForApproval?: ReturnType<typeof createParticipantForApprovalService>;
  saveParticipantForApproval?: ReturnType<typeof saveParticipantForApprovalService>;
  createAccreditationApproval?: ReturnType<typeof createAccreditationApprovalService>;
  approveSaveAccreditation?: typeof approveSaveAccreditationService;
  approveCreateEstablishment?: ReturnType<typeof approveCreateEstablishmentService>;
  approveSyncSiscof?: ReturnType<typeof approveSyncSiscofService>;
}

export function getCredenciamentoApproveServices(
  db: Sequelize,
  siscofWrapper: SiscofWrapper,
  logger: LoggerInterface
) {
  const services: CredenciamentoApproveServices = {};

  services.validateCredenciamentoBeforeApproval = validateCredenciamentoBeforeApprovalService;
  services.getParticipantFromAccreditationDataForApproval = getParticipantFromAccreditationDataForApprovalService;
  services.getParticipantIdForApproval = getParticipantIdForApprovalService(db);
  services.updateParticipantForApproval = updateParticipantForApprovalService(db);
  services.createParticipantForApproval = createParticipantForApprovalService(db);
  services.saveParticipantForApproval = saveParticipantForApprovalService(services);
  services.createAccreditationApproval = createAccreditationApprovalService(db);
  services.approveSaveAccreditation = approveSaveAccreditationService;
  services.approveCreateEstablishment = approveCreateEstablishmentService(db);
  services.approveSyncSiscof = approveSyncSiscofService(siscofWrapper, logger);

  return services;
}
