import * as Sequelize from 'sequelize';
import { Sequelize as DB } from 'sequelize-database';

import ModelsLoader from '../src/infra/database/ModelsLoader';
import { config } from './config';

const modelPath = `${__dirname}/../src/infra/database/models`;

const sequelize = new Sequelize(
  config.db.connection,
  {
    logging: console.log,
    define: {
      freezeTableName: true
    }
  });

const database = ModelsLoader.load(
  (sequelize as DB),
  modelPath,
);

export default database;
