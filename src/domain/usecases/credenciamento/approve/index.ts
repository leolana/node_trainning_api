import { Sequelize } from 'sequelize-database';
import acceptTermOnApproveUseCase from './acceptTermOnApproveUseCase';
import sendParticipantInvitationUseCase from './sendParticipantInvitationUseCase';
import { Auth } from '../../../../infra/auth';
import checkIndicationsToEstablishmentUseCase from './checkIndicationsToEstablishmentUseCase';

export interface CredenciamentoApproveUseCases {
  acceptTermOnApprove?: ReturnType<typeof acceptTermOnApproveUseCase>;
  sendParticipantInvitation?: ReturnType<typeof sendParticipantInvitationUseCase>;
  checkIndicationsToEstablishment?: ReturnType<typeof checkIndicationsToEstablishmentUseCase>;
}

export function getCredenciamentoApproveUseCases(
  db: Sequelize,
  auth: Auth
) {
  const usecases: CredenciamentoApproveUseCases = {};

  usecases.acceptTermOnApprove = acceptTermOnApproveUseCase(db);
  usecases.sendParticipantInvitation = sendParticipantInvitationUseCase(auth);
  usecases.checkIndicationsToEstablishment = checkIndicationsToEstablishmentUseCase(db);

  return usecases;
}
