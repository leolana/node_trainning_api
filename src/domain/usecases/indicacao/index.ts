import { Sequelize } from 'sequelize-database';
import { SiscofWrapper } from '../../../infra/siscof';
import { Mailer } from '../../../infra/mailer';
import { LoggerInterface } from '../../../infra/logging';

import checkECIndicationUseCase from './checkECIndicationUseCase';
import checkProviderIndicationUseCase from './checkProviderIndicationUseCase';
import getIndicationEstablishmentUseCase from './getIndicationEstablishmentUseCase';
import getProviderNominationUseCase from './getProviderNominationUseCase';
import getProviderNomineesUseCase from './getProviderNomineesUseCase';
import identifier from './identifier';
import indicateProviderUseCase from './indicateProviderUseCase';
import newIndicationUseCase from './newIndicationUseCase';
import rejectNomination from './rejectNomination';
import searchNominationsUseCase from './searchNominationsUseCase';
import searchIdentifiers from './searchIdentifiers';
import updateIndicationEstablishmentUseCase from './updateIndicationEstablishmentUseCase';
import updateProviderNomineesUseCase from './updateProviderNomineesUseCase';

export interface IndicacaoUseCase {
  checkECIndicationUseCase?: ReturnType<typeof checkECIndicationUseCase>;
  checkProviderIndicationUseCase?: ReturnType<typeof checkProviderIndicationUseCase>;
  getIndicationEstablishmentUseCase?: ReturnType<typeof getIndicationEstablishmentUseCase>;
  getProviderNominationUseCase?: ReturnType<typeof getProviderNominationUseCase>;
  getProviderNomineesUseCase?: ReturnType<typeof getProviderNomineesUseCase>;
  identifier?: ReturnType<typeof identifier>;
  indicateProviderUseCase?: ReturnType<typeof indicateProviderUseCase>;
  newIndicationUseCase?: ReturnType<typeof newIndicationUseCase>;
  rejectNomination?: ReturnType<typeof rejectNomination>;
  searchNominationsUseCase?: ReturnType<typeof searchNominationsUseCase>;
  searchIdentifiers?: ReturnType<typeof searchIdentifiers>;
  updateIndicationEstablishmentUseCase?: ReturnType<typeof updateIndicationEstablishmentUseCase>;
  updateProviderNomineesUseCase?: ReturnType<typeof updateProviderNomineesUseCase>;
}

export function getIndicacaoUseCases(
  db: Sequelize,
  siscofWrapper: SiscofWrapper,
  mailer: Mailer,
  mailerSettigs: any,
  logger: LoggerInterface
) {
  const usecases: IndicacaoUseCase = {};

  usecases.checkECIndicationUseCase = checkECIndicationUseCase(db);
  usecases.checkProviderIndicationUseCase = checkProviderIndicationUseCase(db);
  usecases.getIndicationEstablishmentUseCase = getIndicationEstablishmentUseCase(db);
  usecases.getProviderNominationUseCase = getProviderNominationUseCase(db);
  usecases.getProviderNomineesUseCase = getProviderNomineesUseCase(db);
  usecases.identifier = identifier(db);
  usecases.indicateProviderUseCase = indicateProviderUseCase(db, mailer, mailerSettigs, logger);
  usecases.newIndicationUseCase = newIndicationUseCase(db);
  usecases.rejectNomination = rejectNomination(db, mailer);
  usecases.searchNominationsUseCase = searchNominationsUseCase(db);
  usecases.searchIdentifiers = searchIdentifiers(db);
  usecases.updateIndicationEstablishmentUseCase = updateIndicationEstablishmentUseCase(db);
  usecases.updateProviderNomineesUseCase = updateProviderNomineesUseCase(db);

  return usecases;
}
