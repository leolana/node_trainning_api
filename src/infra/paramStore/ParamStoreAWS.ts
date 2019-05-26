import { injectable } from 'inversify';
import * as awsParamStore from 'aws-param-store';

import ParamStore from './ParamStore';
import { Environment } from '../environment/Environment';
import { SSM } from 'aws-sdk';

@injectable()
class ParamStoreAWS implements ParamStore {
  private settings: Environment;

  constructor(config: Environment) {
    this.settings = config;
  }

  getParameters = (): SSM.Types.ParameterList => {
    const clientAWSConfig = { region: this.settings.paramStore.region } as SSM.ClientConfiguration;

    const getParametersByPathSync =
      (path = '/', options = undefined): SSM.Types.ParameterList =>
        awsParamStore.parameterQuery(options)
          .path(path)
          .decryption(false)
          .executeSync() as SSM.Types.ParameterList;

    try {
      const results: SSM.Types.ParameterList =
        getParametersByPathSync(
          this.settings.paramStore.appPath,
          clientAWSConfig
        );

      if (typeof results === 'undefined' || (results).length === 0) {
        throw new Error(`Cannot find AWS Parameter Store to ${this.settings.paramStore.appPath} path`);
      }

      console.log(results);

      return results;
    } catch (error) {
      console.log(
        `There was a problem reading the AWS Parameter Store to ${this.settings.paramStore.appPath} path`
      );
      throw error;
    }
  }
}

export default ParamStoreAWS;
