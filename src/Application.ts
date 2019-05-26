// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';

import { injectable, inject } from 'inversify';
import { Sequelize } from 'sequelize-database';

import types from './constants/types';
import Server from './infra/api/Server';
import { LoggerInterface } from './infra/logging/LoggerInterface';

@injectable()
class Application {
  public server: Server;
  public database: Sequelize;
  public logger: LoggerInterface;

  constructor(
    @inject(types.Server) server: Server,
    @inject(types.Database) database: Sequelize,
    @inject(types.Logger) logger: LoggerInterface,
  ) {
    this.server = server;
    this.database = database;
    this.logger = logger;

    if (database && database.options.logging) {
      database.options.logging = (...args) => logger.info(args[0]);
    }
  }

  async start() {
    if (this.database) {
      await this.database.authenticate();
    }

    await this.server.start();
  }
}

export default Application;
