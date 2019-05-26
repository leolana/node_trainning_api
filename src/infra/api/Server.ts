import * as express from 'express';
import { injectable, inject } from 'inversify';

import router from './router';
import { LoggerInterface } from '../logging/LoggerInterface';
import { banner } from '../console/Banner';

import { config } from '../../config';
import types from '../../constants/types';

@injectable()
class Server {
  private express: express.Express;
  private logger: LoggerInterface;

  constructor(
    @inject(types.Logger) logger: LoggerInterface,
  ) {
    this.logger = logger;
    this.express = express();

    this.express.use(router());
  }

  start() {
    return new Promise((resolve) => {
      this.express
        .listen(config.app.port, () => {
          banner(this.logger);
          resolve();
        });
    });
  }
}

export default Server;
