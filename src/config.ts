import * as dotenv from 'dotenv';

import { getOsEnv, getOsEnvOptional, normalizePort, toBool, convertCertificate } from './infra/environment';
import * as pkg from '../package.json';

/**
 * Load .env file or for tests the .env.test file.
 */
dotenv.config();

/**
 * Environment variables
 */

const isProduction = process.env.NODE_ENV === 'production';
const isStaging = process.env.NODE_ENV === 'staging';
const isTesting = process.env.NODE_ENV === 'testing';
const isDevelopment = process.env.NODE_ENV === 'development';

export const config = {
  isProduction,
  isStaging,
  isTesting,
  isDevelopment,
  node: process.env.NODE_ENV,
  app: {
    name: (pkg as any).name,
    version: (pkg as any).version,
    port: normalizePort(process.env.PORT || getOsEnv('PORT')),
    banner: true,
    uri: 'http://localhost'
  },
  log: {
    level: getOsEnv('ALPE_LOGS_STDOUT_LEVEL'),
    output: getOsEnv('ALPE_LOGS_STDERR_LEVEL'),
  },
  db: {
    connection: getOsEnv('ALPE_CONNECTION_STRING'),
    logging: toBool(getOsEnv('ALPE_DATABASE_LOGGING')),
  },
  siscof: {
    enableMock: toBool(getOsEnvOptional('ENABLE_MOCK_SISCOF')),
    user: getOsEnv('ALPE_SISCOF_USER'),
    password: getOsEnv('ALPE_SISCOF_PASSWORD'),
    connectString: getOsEnv('ALPE_SISCOF_CONNECTSTRING'),
    poolAlias       : 'siscof',
    _enableStats    : false,
    poolIncrement   : 1,
    poolMin         : 0,
    poolMax         : 4,
    poolPingInterval: 60,
    poolTimeout     : 60,
    queueRequests   : true,
    queueTimeout    : 60000,
  },
  auth: {
    enableMock: toBool(getOsEnvOptional('ENABLE_MOCK_AUTH')),
    address: getOsEnv('ALPE_KEYCLOAK_ADDRESS'),
    adminUsername: getOsEnv('ALPE_KEYCLOAK_ADMIN_USERNAME'),
    adminPassword: getOsEnv('ALPE_KEYCLOAK_ADMIN_PASSWORD'),
    clientId: getOsEnv('ALPE_KEYCLOAK_CLIENT_ID'),
    clientSecret: getOsEnv('ALPE_KEYCLOAK_CLIENT_SECRET'),
    clientUUID: getOsEnv('ALPE_KEYCLOAK_CLIENT_UUID'),
    publicKey: isDevelopment || isTesting
      ? getOsEnv('ALPE_KEYCLOAK_PUBLIC_KEY')
      : convertCertificate(getOsEnv('ALPE_KEYCLOAK_PUBLIC_KEY')),
    realm: getOsEnv('ALPE_KEYCLOAK_REALM'),
    baseUrl: getOsEnv('ALPE_URL'),
  },
  internalApis: {
    enableMock: toBool(getOsEnvOptional('ENABLE_MOCK_INTERNALAPIS')),
    addressBancos: getOsEnv('ALPE_APIS_BANCOS_ADDRESS'),
    addressCEPs: getOsEnv('ALPE_APIS_CEPS_ADDRESS'),
    financial: {
      auth: Buffer.from(
        `${getOsEnv('ALPE_APIS_FINANCIAL_LOGIN')}:${getOsEnv('ALPE_APIS_FINANCIAL_PWD')}`,
      ).toString('base64'),
      address: getOsEnv('ALPE_APIS_FINANCIAL_ADDRESS'),
    },
  },
  movidesk: {
    enableMock: toBool(getOsEnvOptional('ENABLE_MOCK_MOVIDESK')),
    address: getOsEnv('ALPE_APIS_MOVIDESK'),
    token: getOsEnv('ALPE_MOVIDESK_TOKEN'),
    enabled: false
  },
  storage: {
    enableMock: toBool(getOsEnvOptional('ENABLE_MOCK_FILESTORAGE')),
    region: getOsEnv('ALPE_STORAGE_REGION'),
    bucket: getOsEnv('ALPE_STORAGE_BUCKET'),
  },
  mailer: {
    enableMock: toBool(getOsEnvOptional('ENABLE_MOCK_MAILER')),
    region: getOsEnv('ALPE_SES_REGION'),
    origin: getOsEnv('ALPE_MAILER_ORIGIN'),
    baseUrl: getOsEnv('ALPE_URL'),
    mailingList: getOsEnv('ALPE_MAILING_LIST').split(';'),
  },
  sentry: {
    dsn: getOsEnv('ALPE_SENTRY_DSN'),
    environment: getOsEnv('NODE_ENV'),
  },
  monitor: {
    enabled: true,
    route: '/monitor'
  },
  swagger: {
    enabled: true,
    route: '/swagger',
  },
  healthCheck: {
    route: '/health-check',
  }
};
