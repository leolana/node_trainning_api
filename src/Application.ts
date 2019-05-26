// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';

import { injectable, inject } from 'inversify';
import { Sequelize } from 'sequelize-database';

import types from './constants/types';
import Server from './infra/api/Server';
import { LoggerInterface } from './infra/logging/LoggerInterface';
import { Environment } from './infra/environment/Environment';

@injectable()
class Application {
  public server: Server;
  public database: Sequelize;
  public logger: LoggerInterface;
  public config: Environment;

  constructor(
    @inject(types.Server) server: Server,
    @inject(types.Database) database: Sequelize,
    @inject(types.Logger) logger: LoggerInterface,
    @inject(types.Environment) environment: Environment,
  ) {
    if (database && database.options.logging) {
      database.options.logging = (...args) => logger.info(args[0]);
    }

    this.server = server;
    this.database = database;
    this.logger = logger;
    this.config = environment;
  }

  async start() {
    if (!this.config) {
      throw new Error('Not set environmet config!!');
    }

    if (this.database) {
      await this.database.authenticate();
    }

    await this.server.start();
  }
}

export default Application;
