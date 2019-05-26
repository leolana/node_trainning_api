import { Sequelize } from 'sequelize-database';
import { FileStorage } from '../../../infra/fileStorage';
import { Mailer } from '../../../infra/mailer';
import { MailerEnv } from '../../../infra/environment/Environment';
import { LoggerInterface } from '../../../infra/logging';
import { SiscofWrapper } from '../../../infra/siscof';

import searchEcNominationUseCase from './searchEcNominationUseCase';
import getProviderNomineesUseCase from './getProviderNomineesUseCase';
import updateProviderNomineesUseCase from './updateProviderNomineesUseCase';
import getProviderBondsUseCase from './getProviderBondsUseCase';
import fetchReportFile from './fetchReportFile';
import indicateProviderUseCase from './indicateProviderUseCase';
import linkUseCase from './linkUseCase';
import getBondsUseCase from './getBondsUseCase';
import searchParticipantUseCase from './searchParticipantUseCase';

export interface ParticipantesUseCases {
  searchEcNomination?: ReturnType<typeof searchEcNominationUseCase>;
  getProviderNominees?: ReturnType<typeof getProviderNomineesUseCase>;
  updateProviderNominees?: ReturnType<typeof updateProviderNomineesUseCase>;
  getProviderBonds?: ReturnType<typeof getProviderBondsUseCase>;
  fetchReportFile?: ReturnType<typeof fetchReportFile>;
  indicateProvider?: ReturnType<typeof indicateProviderUseCase>;
  link?: ReturnType<typeof linkUseCase>;
  getBonds?: ReturnType<typeof getBondsUseCase>;
  searchParticipant?: ReturnType<typeof searchParticipantUseCase>;
}

export function getParticipantesUseCases(
  db: Sequelize,
  siscofWrapper: SiscofWrapper,
  fileStorage: FileStorage,
  mailer: Mailer,
  mailerSettings: MailerEnv,
  logger: LoggerInterface
) {
  const usecases: ParticipantesUseCases = {};

  usecases.searchEcNomination = searchEcNominationUseCase(db);
  usecases.getProviderNominees = getProviderNomineesUseCase(db);
  usecases.updateProviderNominees = updateProviderNomineesUseCase(db);
  usecases.getProviderBonds = getProviderBondsUseCase(db, siscofWrapper);
  usecases.fetchReportFile = fetchReportFile(db, fileStorage);
  usecases.indicateProvider = indicateProviderUseCase(db, mailer, mailerSettings, logger);
  usecases.link = linkUseCase(db, siscofWrapper, mailer, mailerSettings);
  usecases.getBonds = getBondsUseCase(db);
  usecases.searchParticipant = searchParticipantUseCase(db);
  return usecases;
}
