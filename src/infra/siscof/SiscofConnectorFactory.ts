import { interfaces } from 'inversify';

import SiscofConnector from './SiscofConnector';
import SiscofConnectorDev from './SiscofConnectorDev';
import SiscofConnectorProd from './SiscofConnectorProd';
import { Environment } from '../environment/Environment';

import types from '../../constants/types';

class SiscofConnectorFactory {
  private context: interfaces.Context;

  constructor(
    context: interfaces.Context
  ) {
    this.context = context;
  }

  create(): SiscofConnector {
    const config = this.context.container.get<Environment>(types.Environment);
    const siscofConnector: SiscofConnector = (config.isDevelopment || config.isTesting)
      ? this.context.container.get<SiscofConnectorDev>(types.SiscofConnectorDev)
      : this.context.container.get<SiscofConnectorProd>(types.SiscofConnectorProd);

    return (siscofConnector);
  }
}

export default SiscofConnectorFactory;
