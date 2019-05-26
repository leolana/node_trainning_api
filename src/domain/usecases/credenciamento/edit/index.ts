import { Sequelize } from 'sequelize-database';
import { Mailer } from '../../../../infra/mailer';
import { config } from '../../../../config';

import findAccreditationParticipantUseCase from './findAccreditationParticipantUseCase';
import setAccreditationNewRateValuesUseCase from './setAccreditationNewRateValuesUseCase';
import inactivatePreviousAccreditationUseCase from './inactivatePreviousAccreditationUseCase';
import updateParticipantRateUseCase from './updateParticipantRateUseCase';
import checkIfBankingDataChangedUseCase from './checkIfBankingDataChangedUseCase';
import sendEmailAccreditationDataChangedUseCase from './sendEmailAccreditationDataChangedUseCase';
import validateAccreditationBeforeEditUseCase from './validateAccreditationBeforeEditUseCase';

export interface CredenciamentoEditUseCases {
  findAccreditationParticipant?: ReturnType<typeof findAccreditationParticipantUseCase>;
  setAccreditationNewRateValues?: typeof setAccreditationNewRateValuesUseCase;
  inactivatePreviousAccreditation?: ReturnType<typeof inactivatePreviousAccreditationUseCase>;
  updateParticipantRate?: ReturnType<typeof updateParticipantRateUseCase>;
  checkIfBankingDataChanged?: typeof checkIfBankingDataChangedUseCase;
  sendEmailAccreditationDataChanged?: ReturnType<typeof sendEmailAccreditationDataChangedUseCase>;
  validateAccreditationBeforeEdit?: typeof validateAccreditationBeforeEditUseCase;
}

export function getCredenciamentoEditUseCases(
  db: Sequelize,
  mailer: Mailer,
  mailerSettigs: typeof config.mailer
) {
  const usecases: CredenciamentoEditUseCases = {};

  usecases.findAccreditationParticipant = findAccreditationParticipantUseCase(db);
  usecases.setAccreditationNewRateValues = setAccreditationNewRateValuesUseCase;
  usecases.inactivatePreviousAccreditation = inactivatePreviousAccreditationUseCase(db);
  usecases.updateParticipantRate = updateParticipantRateUseCase(db);
  usecases.checkIfBankingDataChanged = checkIfBankingDataChangedUseCase;
  usecases.sendEmailAccreditationDataChanged = sendEmailAccreditationDataChangedUseCase(mailer, mailerSettigs);
  usecases.validateAccreditationBeforeEdit = validateAccreditationBeforeEditUseCase;

  return usecases;
}
