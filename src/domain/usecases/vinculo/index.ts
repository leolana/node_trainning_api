import { Sequelize } from 'sequelize-typescript';
import { SiscofWrapper } from '../../../infra/siscof';
import { Mailer } from '../../../infra/mailer';

import getProviderLinksUseCase from './getProviderLinksUseCase';
import getProviderNominationUseCase from '../indicacao/getProviderNominationUseCase';
import getBondsUseCase from './getBondsUseCase';
import getProviderBondsUseCase from './getProviderBondsUseCase';
import getProviderRequestedLinksUsecase from './getProviderRequestedLinksUsecase';
import linkUseCase from './linkUseCase';
import myEstablishmentsUseCase from './myEstablishmentsUseCase';

export interface VinculoUseCase {
  getBondsUseCase?: ReturnType<typeof getBondsUseCase>;
  getProviderBondsUseCase?: ReturnType<typeof getProviderBondsUseCase>;
  getProviderLinksUseCase?: ReturnType<typeof getProviderLinksUseCase>;
  getProviderNominationUseCase?: ReturnType<typeof getProviderNominationUseCase>;
  getProviderRequestedLinksUsecase?: ReturnType<typeof getProviderRequestedLinksUsecase>;
  linkUseCase?: ReturnType<typeof linkUseCase>;
  myEstablishmentsUseCase?: ReturnType<typeof myEstablishmentsUseCase>;
}

export function getVinculoUseCases(
  db: Sequelize,
  siscofWrapper: SiscofWrapper,
  mailer: Mailer,
  mailerSettigs: any,
) {
  const usecases: VinculoUseCase = {};

  usecases.getBondsUseCase = getBondsUseCase(db);
  usecases.getProviderBondsUseCase = getProviderBondsUseCase(db, siscofWrapper);
  usecases.getProviderLinksUseCase = getProviderLinksUseCase(db, siscofWrapper);
  usecases.getProviderNominationUseCase = getProviderNominationUseCase(db);
  usecases.getProviderRequestedLinksUsecase = getProviderRequestedLinksUsecase(db);
  usecases.linkUseCase = linkUseCase(db, siscofWrapper, mailer, mailerSettigs);
  usecases.myEstablishmentsUseCase = myEstablishmentsUseCase(db);

  return usecases;
}
