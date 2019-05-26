import { interfaces } from 'inversify';

import { Environment } from '../environment/Environment';
import { winstonLoader } from './WinstonLoader';
import { LoggerInterface } from './LoggerInterface';
import Logger from './Logger';

import types from '../../constants/types';

class LoggerFactory {
  private context: interfaces.Context;

  constructor(
    context: interfaces.Context
  ) {
    this.context = context;
  }
  create(): LoggerInterface {
    const config = this.context.container.get<Environment>(types.Environment);

    const winstonLogger = winstonLoader(config);
    const logger: LoggerInterface = new Logger(winstonLogger);

    return logger;
  }
}

export default LoggerFactory;
