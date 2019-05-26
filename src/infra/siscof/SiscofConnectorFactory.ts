import { interfaces } from 'inversify';

import SiscofConnector from './SiscofConnector';
import SiscofConnectorDev from './SiscofConnectorDev';
import SiscofConnectorProd from './SiscofConnectorProd';

import types from '../../constants/types';
import { config } from '../../config';

class SiscofConnectorFactory {
  private context: interfaces.Context;

  constructor(
    context: interfaces.Context
  ) {
    this.context = context;
  }

  create(): SiscofConnector {
    const siscofConnector: SiscofConnector = (config.isDevelopment || config.isTesting) && config.siscof.enableMock
      ? this.context.container.get<SiscofConnectorDev>(types.SiscofConnectorDev)
      : this.context.container.get<SiscofConnectorProd>(types.SiscofConnectorProd);

    return siscofConnector;
  }
}

export default SiscofConnectorFactory;
