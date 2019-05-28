import { SSM } from 'aws-sdk';

import {
  Environment,
  LogEnv,
  DatabaseEnv,
  AuthEnv,
  InternalApiEnv,
  MovideskEnv,
  StorageEnv,
  MailerEnv,
  SentryEnv,
} from './Environment';
import {
  getOsEnv,
  toBool,
  convertCertificate,
} from './envParamStore';

export class EnvParamStoreBuilder {
  private configDefault: Environment;
  private configParamStoreAppPath: string;
  private logSettings: LogEnv;
  private dbSettings: DatabaseEnv;
  private authSettings: AuthEnv;
  private internalApiSettings: InternalApiEnv;
  private movideskSettings: MovideskEnv;
  private storageSettings: StorageEnv;
  private mailerSettings: MailerEnv;
  private sentrySettings: SentryEnv;

  constructor(
    configDefault: Environment,
  ) {
    this.configDefault = configDefault;
    this.configParamStoreAppPath = configDefault.paramStore.appPath;
  }

  addLogEnv = (keyParams, valueParams: SSM.Types.ParameterList): EnvParamStoreBuilder => {
    const level = getOsEnv(valueParams, this.configParamStoreAppPath, keyParams.level);
    const output = getOsEnv(valueParams, this.configParamStoreAppPath, keyParams.output);

    const logParamEnv = {
      level,
      output,
    } as LogEnv;

    const logEnv: LogEnv = Object.assign({}, this.configDefault.log, logParamEnv);

    this.logSettings = logEnv;
    return this;
  }

  addDbEnv = (keyParams, valueParams: SSM.Types.ParameterList): EnvParamStoreBuilder => {
    const connection = getOsEnv(valueParams, this.configParamStoreAppPath, keyParams.connection);
    const logging = toBool(getOsEnv(valueParams, this.configParamStoreAppPath, keyParams.logging));

    const dbParamEnv = {
      connection,
      logging,
    } as DatabaseEnv;

    const dbEnv: DatabaseEnv = Object.assign({}, this.configDefault.db, dbParamEnv);

    this.dbSettings = dbEnv;
    return this;
  }

  addAuthEnv = (keyParams, valueParams: SSM.Types.ParameterList): EnvParamStoreBuilder => {
    const address = getOsEnv(valueParams, this.configParamStoreAppPath, keyParams.address);
    const adminUsername = getOsEnv(valueParams, this.configParamStoreAppPath, keyParams.adminUsername);
    const adminPassword = getOsEnv(valueParams, this.configParamStoreAppPath, keyParams.adminPassword);
    const clientId = getOsEnv(valueParams, this.configParamStoreAppPath, keyParams.clientId);
    const clientSecret = getOsEnv(valueParams, this.configParamStoreAppPath, keyParams.clientSecret);
    const clientUUID = getOsEnv(valueParams, this.configParamStoreAppPath, keyParams.clientUUID);
    const realm = getOsEnv(valueParams, this.configParamStoreAppPath, keyParams.realm);
    const baseUrl = getOsEnv(valueParams, this.configParamStoreAppPath, keyParams.baseUrl);
    const publicKey =  this.configDefault.isDevelopment || this.configDefault.isTesting
        ? this.configDefault.auth.publicKey
        : convertCertificate(getOsEnv(valueParams, this.configParamStoreAppPath, keyParams.publicKey));

    const authParamsEnv = {
      address,
      adminUsername,
      adminPassword,
      clientId,
      clientSecret,
      clientUUID,
      realm,
      baseUrl,
      publicKey,
    } as AuthEnv;

    const authEnv: AuthEnv = Object.assign({}, this.configDefault.auth, authParamsEnv);

    this.authSettings = authEnv;

    return this;
  }

  addInternalApiEnv = (keyParams, valueParams: SSM.Types.ParameterList): EnvParamStoreBuilder => {
    const addressBancos = getOsEnv(valueParams, this.configParamStoreAppPath, keyParams.addressBancos);
    const addressCEPs = getOsEnv(valueParams, this.configParamStoreAppPath, keyParams.addressCEPs);

    const internalApiParamsEnv = {
      addressBancos,
      addressCEPs,
    } as InternalApiEnv;

    const internalApiEnv: InternalApiEnv = Object.assign({}, this.configDefault.internalApis, internalApiParamsEnv);

    this.internalApiSettings = internalApiEnv;

    return this;
  }

  addMovideskEnv = (keyParams, valueParams: SSM.Types.ParameterList): EnvParamStoreBuilder => {
    const address = getOsEnv(valueParams, this.configParamStoreAppPath, keyParams.address);
    const token = getOsEnv(valueParams, this.configParamStoreAppPath, keyParams.token);

    const movideskParamsEnv = {
      address,
      token,
    } as MovideskEnv;

    const movideskEnv: MovideskEnv = Object.assign({}, this.configDefault.movidesk, movideskParamsEnv);

    this.movideskSettings = movideskEnv;

    return this;
  }

  addStorageEnv = (keyParams, valueParams: SSM.Types.ParameterList): EnvParamStoreBuilder => {
    const region = getOsEnv(valueParams, this.configParamStoreAppPath, keyParams.region);
    const bucket = getOsEnv(valueParams, this.configParamStoreAppPath, keyParams.bucket);

    const storageParamsEnv = {
      region,
      bucket,
    } as StorageEnv;

    const storageEnv: StorageEnv = Object.assign({}, this.configDefault.storage, storageParamsEnv);

    this.storageSettings = storageEnv;
    return this;
  }

  addMailerEnv = (keyParams, valueParams: SSM.Types.ParameterList): EnvParamStoreBuilder => {
    const region = getOsEnv(valueParams, this.configParamStoreAppPath, keyParams.region);
    const origin = getOsEnv(valueParams, this.configParamStoreAppPath, keyParams.origin);
    const baseUrl = getOsEnv(valueParams, this.configParamStoreAppPath, keyParams.baseUrl);
    const mailingList = getOsEnv(valueParams, this.configParamStoreAppPath, keyParams.mailingList).split(';');

    const mailerParamsEnv = {
      region,
      origin,
      baseUrl,
      mailingList
    } as MailerEnv;

    const mailerEnv: MailerEnv = Object.assign({}, this.configDefault.mailer, mailerParamsEnv);

    this.mailerSettings = mailerEnv;
    return this;
  }

  addSentryEnv = (keyParams, valueParams: SSM.Types.ParameterList): EnvParamStoreBuilder => {
    const dsn = getOsEnv(valueParams, this.configParamStoreAppPath, keyParams.dsn);

    const sentryParamsEnv = {
      dsn,
    } as SentryEnv;

    const sentryEnv: SentryEnv = Object.assign({}, this.configDefault.sentry, sentryParamsEnv);

    this.sentrySettings = sentryEnv;
    return this;
  }

  build = (): Environment => {
    const settingsParams = {
      log: this.logSettings,
      db: this.dbSettings,
      auth: this.authSettings,
      internalApis: this.internalApiSettings,
      movidesk: this.movideskSettings,
      storage: this.storageSettings,
      mailer: this.mailerSettings,
      sentry: this.sentrySettings
    } as Environment;

    return Object.assign({}, this.configDefault, settingsParams);
  }
}
