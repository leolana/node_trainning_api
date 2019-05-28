import { Sequelize } from 'sequelize-database';
import testPostgresConnectionUseCase from './testPostgresConnectionUseCase';

export enum healthCheckServicesEnum {
  postgres = 1,
}

export interface HealthCheckUseCases {
  testPostgresConnectionUseCase?: ReturnType<typeof testPostgresConnectionUseCase>;
}

export function getHealthCheckUseCases(
  db: Sequelize,
) {
  const usecases: HealthCheckUseCases = {};

  usecases.testPostgresConnectionUseCase = testPostgresConnectionUseCase(db);
  return usecases;
}
