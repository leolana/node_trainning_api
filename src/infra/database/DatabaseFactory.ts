import { interfaces } from 'inversify';
import { Sequelize } from 'sequelize-typescript';

import { Environment } from '../environment/Environment';

import types from '../../constants/types';

const modelPath = `${__dirname}/models`;

class DatabaseFactory {
  private context: interfaces.Context;

  constructor(
    context: interfaces.Context
  ) {
    this.context = context;
  }
  create(): Sequelize {
    const config = this.context.container.get<Environment>(types.Environment);

    return new Sequelize(
      config.db.connection,
      {
        modelPaths: [modelPath],
        logging: config.db.logging ? console.log : false,
        define: {
          freezeTableName: true
        }
      }
    );
  }
}

export default DatabaseFactory;
