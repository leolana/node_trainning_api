import * as express from 'express';
import { injectable, inject } from 'inversify';

import router from './router';
import { LoggerInterface } from '../logging/LoggerInterface';
import { banner } from '../console/Banner';
import { Environment } from '../../infra/environment/Environment';

import types from '../../constants/types';

@injectable()
class Server {
  private express: express.Express;
  private logger: LoggerInterface;
  private config: Environment;

  constructor(
    @inject(types.Logger) logger: LoggerInterface,
    @inject(types.Environment) config: Environment,
  ) {
    this.logger = logger;
    this.express = express();

    this.express.use(router());
    this.config = config;
  }

  start() {
    return new Promise((resolve) => {
      this.express
        .listen(this.config.app.port, () => {
          banner(this.logger);
          resolve();
        });
    });
  }
}

export default Server;
