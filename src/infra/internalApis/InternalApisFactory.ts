import { interfaces } from 'inversify';

import InternalApis from './InternalApis';
import InternalApisDev from './InternalApisDev';
import InternalApisProd from './InternalApisProd';

import types from '../../constants/types';
import { config } from '../../config';

class InternalApisFactory {
  private context: interfaces.Context;

  constructor(
    context: interfaces.Context
  ) {
    this.context = context;
  }

  create(): InternalApis {
    const internalApis: InternalApis = (config.isDevelopment || config.isTesting) && config.internalApis.enableMock
      ? this.context.container.get<InternalApisDev>(types.InternalApisDev)
      : this.context.container.get<InternalApisProd>(types.InternalApisProd);

    return internalApis;
  }
}

export default InternalApisFactory;
