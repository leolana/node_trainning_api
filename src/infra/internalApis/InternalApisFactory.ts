import { interfaces } from 'inversify';

import InternalApis from './InternalApis';
import InternalApisDev from './InternalApisDev';
import InternalApisProd from './InternalApisProd';
import { Environment } from '../environment/Environment';

import types from '../../constants/types';

class InternalApisFactory {
  private context: interfaces.Context;

  constructor(
    context: interfaces.Context
  ) {
    this.context = context;
  }

  create(): InternalApis {
    const config = this.context.container.get<Environment>(types.Environment);

    const internalApis: InternalApis = (config.isDevelopment || config.isTesting) && config.internalApis.enableMock
      ? this.context.container.get<InternalApisDev>(types.InternalApisDev)
      : this.context.container.get<InternalApisProd>(types.InternalApisProd);

    return internalApis;
  }
}

export default InternalApisFactory;
