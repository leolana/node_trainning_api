import {
  getOsEnv,
  getOsEnvOptional,
  normalizePort,
  toBool,
  convertCertificate,
} from './envProcess';
import {
  Environment,
  AppEnv,
  LogEnv,
  DatabaseEnv,
  SiscofEnv,
  AuthEnv,
  InternalApiEnv,
  MovideskEnv,
  StorageEnv,
  ParamStoreEnv,
  MailerEnv,
  SentryEnv,
} from './Environment';

import * as dotenv from 'dotenv';

/**
 * Load .env file or for tests the .env.test file.
 */
dotenv.config();

export class EnvProcessBuilder {
  private configDefault: Environment;
  private appSettings: AppEnv;
  private logSettings: LogEnv;
  private dbSettings: DatabaseEnv;
  private siscofSettings: SiscofEnv;
  private authSettings: AuthEnv;
  private internalApiSettings: InternalApiEnv;
  private movideskSettings: MovideskEnv;
  private storageSettings: StorageEnv;
  private paramStoreSettings: ParamStoreEnv;
  private mailerSettings: MailerEnv;
  private sentrySettings: SentryEnv;
  private isProduction = process.env.NODE_ENV === 'production';
  private isStaging = process.env.NODE_ENV === 'staging';
  private isTesting = process.env.NODE_ENV === 'testing';
  private isDevelopment = process.env.NODE_ENV === 'development';

  constructor(
    configDefault: Environment,
  ) {
    this.configDefault = configDefault;
  }

  addAppEnv = (): EnvProcessBuilder => {
    const appProcessEnv = {
      port: normalizePort(process.env.PORT || getOsEnv('PORT')),
    } as AppEnv;

    const appEnv: AppEnv = Object.assign({}, this.configDefault.app, appProcessEnv);

    this.appSettings = appEnv;

    return this;
  }

  addLogEnv = (): EnvProcessBuilder => {
    const logProcessEnv = {
      level: getOsEnv('ALPE_LOGS_STDOUT_LEVEL'),
      output: getOsEnv('ALPE_LOGS_STDERR_LEVEL'),
    } as LogEnv;

    const logEnv: LogEnv = Object.assign({}, this.configDefault.log, logProcessEnv);

    this.logSettings = logEnv;

    return this;
  }

  addDbEnv = (): EnvProcessBuilder => {
    const dbProcessEnv = {
      connection: getOsEnv('ALPE_CONNECTION_STRING'),
      logging: toBool(getOsEnv('ALPE_DATABASE_LOGGING')),
    } as DatabaseEnv;

    const dbEnv: DatabaseEnv = Object.assign({}, this.configDefault.db, dbProcessEnv);

    this.dbSettings = dbEnv;

    return this;
  }

  addSiscofEnv = (): EnvProcessBuilder => {
    const siscofProcessEnv = {
      enableMock: toBool(getOsEnvOptional('ENABLE_MOCK_SISCOF')),
      user: getOsEnv('ALPE_SISCOF_USER'),
      password: getOsEnv('ALPE_SISCOF_PASSWORD'),
      connectString: getOsEnv('ALPE_SISCOF_CONNECTSTRING'),
    } as SiscofEnv;

    const siscofEnv: SiscofEnv = Object.assign({}, this.configDefault.siscof, siscofProcessEnv);

    this.siscofSettings = siscofEnv;

    return this;
  }

  addAuthEnv = (): EnvProcessBuilder => {
    const authProcessEnv = {
      enableMock: toBool(getOsEnvOptional('ENABLE_MOCK_AUTH')),
      address: getOsEnv('ALPE_KEYCLOAK_ADDRESS'),
      adminUsername: getOsEnv('ALPE_KEYCLOAK_ADMIN_USERNAME'),
      adminPassword: getOsEnv('ALPE_KEYCLOAK_ADMIN_PASSWORD'),
      clientId: getOsEnv('ALPE_KEYCLOAK_CLIENT_ID'),
      clientSecret: getOsEnv('ALPE_KEYCLOAK_CLIENT_SECRET'),
      clientUUID: getOsEnv('ALPE_KEYCLOAK_CLIENT_UUID'),
      publicKey:
        this.isDevelopment || this.isTesting
          ? getOsEnv('ALPE_KEYCLOAK_PUBLIC_KEY')
          : convertCertificate(getOsEnv('ALPE_KEYCLOAK_PUBLIC_KEY')),
      realm: getOsEnv('ALPE_KEYCLOAK_REALM'),
      baseUrl: getOsEnv('ALPE_URL'),
    } as AuthEnv;

    const authEnv: AuthEnv = Object.assign({}, this.configDefault.auth, authProcessEnv);

    this.authSettings = authEnv;

    return this;
  }

  addInternalApiEnv = (): EnvProcessBuilder => {
    const internalApiProcessEnv = {
      enableMock: toBool(getOsEnvOptional('ENABLE_MOCK_INTERNALAPIS')),
      addressBancos: getOsEnv('ALPE_APIS_BANCOS_ADDRESS'),
      addressCEPs: getOsEnv('ALPE_APIS_CEPS_ADDRESS'),
      financial: {
        auth: Buffer.from(
          `${getOsEnv('ALPE_APIS_FINANCIAL_LOGIN')}:${getOsEnv(
            'ALPE_APIS_FINANCIAL_PWD'
          )}`
        ).toString('base64'),
        address: getOsEnv('ALPE_APIS_FINANCIAL_ADDRESS'),
      },
    } as InternalApiEnv;

    const internalApiEnv: InternalApiEnv = Object.assign({}, this.configDefault.internalApis, internalApiProcessEnv);

    this.internalApiSettings = internalApiEnv;

    return this;
  }

  addMovideskEnv = (): EnvProcessBuilder => {
    const movideskProcessEnv = {
      enableMock: toBool(getOsEnvOptional('ENABLE_MOCK_MOVIDESK')),
      address: getOsEnv('ALPE_APIS_MOVIDESK'),
      token: getOsEnv('ALPE_MOVIDESK_TOKEN'),
    } as MovideskEnv;

    const movideskEnv: MovideskEnv = Object.assign({}, this.configDefault.movidesk, movideskProcessEnv);

    this.movideskSettings = movideskEnv;

    return this;
  }

  addStorageEnv = (): EnvProcessBuilder => {
    const storageProcessEnv = {
      enableMock: toBool(getOsEnvOptional('ENABLE_MOCK_FILESTORAGE')),
      region: getOsEnv('ALPE_STORAGE_REGION'),
      bucket: getOsEnv('ALPE_STORAGE_BUCKET'),
    } as StorageEnv;

    const storageEnv: StorageEnv = Object.assign({}, this.configDefault.storage, storageProcessEnv);

    this.storageSettings = storageEnv;
    return this;
  }

  addMailerEnv = (): EnvProcessBuilder => {
    const mailerProcessEnv = {
      enableMock: toBool(getOsEnvOptional('ENABLE_MOCK_MAILER')),
      region: getOsEnv('ALPE_SES_REGION'),
      origin: getOsEnv('ALPE_MAILER_ORIGIN'),
      baseUrl: getOsEnv('ALPE_URL'),
      mailingList: getOsEnv('ALPE_MAILING_LIST').split(';'),
    } as MailerEnv;

    const mailerEnv: MailerEnv = Object.assign({}, this.configDefault.mailer, mailerProcessEnv);

    this.mailerSettings = mailerEnv;
    return this;
  }

  addSentryEnv = (): EnvProcessBuilder => {
    const sentryProcessEnv = {
      dsn: getOsEnv('ALPE_SENTRY_DSN'),
      environment: getOsEnv('NODE_ENV'),
    } as SentryEnv;

    const sentryEnv: SentryEnv = Object.assign({}, this.configDefault.sentry, sentryProcessEnv);

    this.sentrySettings = sentryEnv;
    return this;
  }

  addParamStoreEnv = (): EnvProcessBuilder => {
    const paramStoreProcessEnv = {
      enableMock: toBool(getOsEnvOptional('ENABLE_MOCK_PARAMSTORE')),
      region: getOsEnv('ALPE_PARAMSTORE_REGION'),
      appPath: getOsEnv('ALPE_PARAMSTORE_PATH'),
    } as ParamStoreEnv;

    const paramStoreEnv: ParamStoreEnv = Object.assign({}, this.configDefault.paramStore, paramStoreProcessEnv);

    this.paramStoreSettings = paramStoreEnv;
    return this;
  }

  build = (): Environment => {
    const configEnvProcess: Environment = {
      isProduction: this.isProduction,
      isStaging: this.isStaging,
      isTesting: this.isTesting,
      isDevelopment: this.isDevelopment,
      node: process.env.NODE_ENV,
      app: this.appSettings,
      log: this.logSettings,
      db: this.dbSettings,
      siscof: this.siscofSettings,
      auth: this.authSettings,
      internalApis: this.internalApiSettings,
      movidesk: this.movideskSettings,
      storage: this.storageSettings,
      paramStore: this.paramStoreSettings,
      mailer: this.mailerSettings,
      sentry: this.sentrySettings,
    } as Environment;

    const environment: Environment = Object.assign({}, this.configDefault, configEnvProcess);

    return environment;
  }
}
