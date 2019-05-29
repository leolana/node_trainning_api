import {
  Environment,
  AppEnv,
  MonitorEnv,
  SwaggerEnv,
  HealthCheckEnv,
  ParamStoreEnv
} from './infra/environment/Environment';
import * as pkg from '../package.json';

/**
 * Environment variables with default values
 */

export const config: Environment = {
  app: {
    name: (pkg as any).name,
    version: (pkg as any).version,
    banner: true,
    uri: 'http://localhost',
  } as AppEnv,
  paramStore: {
    enabled: false
  } as ParamStoreEnv,
  monitor: {
    enabled: true,
    route: '/monitor',
  } as MonitorEnv,
  swagger: {
    enabled: true,
    route: '/swagger',
  } as SwaggerEnv,
  healthCheck: {
    route: '/health-check',
  } as HealthCheckEnv,
} as Environment;
