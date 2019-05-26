import {
  Environment,
  AppEnv,
  SiscofEnv,
  MonitorEnv,
  SwaggerEnv,
  HealthCheckEnv,
  MovideskEnv,
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
  siscof: {
    poolAlias: 'siscof',
    _enableStats: false,
    poolIncrement: 1,
    poolMin: 0,
    poolMax: 4,
    poolPingInterval: 60,
    poolTimeout: 60,
    queueRequests: true,
    queueTimeout: 60000,
  } as SiscofEnv,
  movidesk: {
  } as MovideskEnv,
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
