import { Sequelize } from 'sequelize-typescript';

import { config } from './config';

const modelPath = `${__dirname}/../src/infra/database/models`;

const database = new Sequelize(
  config.db.connection,
  {
    modelPaths: [modelPath],
    logging: console.log,
    define: {
      freezeTableName: true
    }
  });

export default database;
