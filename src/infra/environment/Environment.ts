export type AppEnv = {
  name: string,
  version: string,
  port: number | string | boolean,
  banner: boolean,
  uri: string
};

export type LogEnv = {
  level: string,
  output: string,
};

export type DatabaseEnv = {
  connection: string,
  logging: boolean
};

export type AuthEnv = {
  enableMock: boolean,
  address: string,
  adminUsername: string,
  adminPassword: string,
  clientId: string,
  clientSecret: string,
  clientUUID: string,
  publicKey: string,
  realm: string,
  baseUrl: string,
};

export type InternalApiEnv = {
  enableMock: boolean,
  addressBancos: string,
  addressCEPs: string,
};

export type MovideskEnv = {
  enableMock: boolean,
  address: string,
  token: string
};

export type StorageEnv = {
  enableMock: boolean,
  region: string,
  bucket: string,
};

export type ParamStoreEnv = {
  enableMock: boolean,
  region: string,
  appPath: string,
  enabled: boolean
};

export type MailerEnv = {
  enableMock: boolean,
  region: string,
  origin: string,
  baseUrl: string,
  mailingList: string[],
};

export type SentryEnv = {
  dsn: string
  environment: string,
};

export type MonitorEnv = {
  enabled: boolean,
  route: string
};

export type SwaggerEnv = {
  enabled: boolean,
  route: string
};

export type HealthCheckEnv = {
  route: string
};

export type Environment = {
  isProduction: boolean,
  isStaging: boolean,
  isTesting: boolean,
  isDevelopment: boolean,
  node: string,
  app: AppEnv,
  log: LogEnv,
  db: DatabaseEnv,
  auth: AuthEnv,
  internalApis: InternalApiEnv,
  movidesk: MovideskEnv,
  storage: StorageEnv,
  paramStore: ParamStoreEnv,
  mailer: MailerEnv,
  sentry: SentryEnv,
  monitor: MonitorEnv,
  swagger: SwaggerEnv,
  healthCheck: HealthCheckEnv,
};
