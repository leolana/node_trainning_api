import { Sequelize } from 'sequelize-database';
import { Auth } from '../../../infra/auth';
import testPostgresConnectionUseCase from './testPostgresConnectionUseCase';
import testKeyCloakAccessUseCase from './testKeyCloakAccessUseCase';

export enum healthCheckServicesEnum {
  postgres = 1,
  oracle = 2,
  keyCloak = 3
}

export interface HealthCheckUseCases {
  testPostgresConnectionUseCase?: ReturnType<typeof testPostgresConnectionUseCase>;
  testKeyCloakAccessUseCase?: ReturnType<typeof testKeyCloakAccessUseCase>;
}

export function getHealthCheckUseCases(
  db: Sequelize,
  auth: Auth
) {
  const usecases: HealthCheckUseCases = {};

  usecases.testPostgresConnectionUseCase = testPostgresConnectionUseCase(db);
  usecases.testKeyCloakAccessUseCase = testKeyCloakAccessUseCase(auth);
  return usecases;
}
