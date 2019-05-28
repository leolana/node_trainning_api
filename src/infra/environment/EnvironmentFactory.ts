import { EnvProcessBuilder } from './EnvProcessBuilder';
import { ParamStoreAWS } from '../paramStore';
import { envParams } from '../paramStore/envParams';
import { Environment } from '../environment/Environment';
import { EnvParamStoreBuilder } from './EnvParamStoreBuilder';

import { config as configDefault } from '../../config';

class EnvironmentFactory {
  create(): Environment {
    const envProcessBuilder = new EnvProcessBuilder(configDefault);
    const configEnvProcess: Environment = envProcessBuilder
      .addAppEnv()
      .addLogEnv()
      .addDbEnv()
      .addAuthEnv()
      .addInternalApiEnv()
      .addStorageEnv()
      .addMailerEnv()
      .addSentryEnv()
      .addParamStoreEnv()
      .build();

    const disabledAWSParamStore = (
        (configEnvProcess.isDevelopment || configEnvProcess.isTesting)
        && configEnvProcess.paramStore.enableMock)
      || !configEnvProcess.paramStore.enabled;

    if (disabledAWSParamStore) {
      return configEnvProcess;
    }

    const paramStore = new ParamStoreAWS(configEnvProcess);
    const awsParameters = paramStore.getParameters();

    const envBuilder = new EnvParamStoreBuilder(configEnvProcess);

    return envBuilder
      .addLogEnv(envParams.log, awsParameters)
      .addDbEnv(envParams.db, awsParameters)
      .addAuthEnv(envParams.auth, awsParameters)
      .addInternalApiEnv(envParams.internalApis, awsParameters)
      .addStorageEnv(envParams.storage, awsParameters)
      .addMailerEnv(envParams.mailer, awsParameters)
      .addSentryEnv(envParams.sentry, awsParameters)
      .build();
  }
}

export default EnvironmentFactory;
