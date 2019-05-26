import { Sequelize } from 'sequelize-database';
import { Auth } from '../../../infra/auth';
import { SiscofConnector } from '../../../infra/siscof';
import testPostgresConnectionUseCase from './testPostgresConnectionUseCase';
import testOracleConnectionUseCase from './testOracleConnectionUseCase';
import testKeyCloakAccessUseCase from './testKeyCloakAccessUseCase';

export enum healthCheckServicesEnum {
  postgres = 1,
  oracle = 2,
  keyCloak = 3
}

export interface HealthCheckUseCases {
  testPostgresConnectionUseCase?: ReturnType<typeof testPostgresConnectionUseCase>;
  testOracleConnectionUseCase?: ReturnType<typeof testOracleConnectionUseCase>;
  testKeyCloakAccessUseCase?: ReturnType<typeof testKeyCloakAccessUseCase>;
}

export function getHealthCheckUseCases(
  db: Sequelize,
  siscofConnector: SiscofConnector,
  auth: Auth
) {
  const usecases: HealthCheckUseCases = {};

  usecases.testPostgresConnectionUseCase = testPostgresConnectionUseCase(db);
  usecases.testOracleConnectionUseCase = testOracleConnectionUseCase(siscofConnector);
  usecases.testKeyCloakAccessUseCase = testKeyCloakAccessUseCase(auth);
  return usecases;
}
