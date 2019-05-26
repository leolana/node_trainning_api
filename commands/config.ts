import * as dotenv from 'dotenv';

import { getOsEnv, toBool } from '../src/infra/environment/envProcess';

/**
 * Load .env file or for tests the .env.test file.
 */
dotenv.config();

/**
 * Environment variables
 */

export const config = {
  node: process.env.NODE_ENV,
  db: {
    connection: getOsEnv('ALPE_CONNECTION_STRING'),
    logging: toBool(getOsEnv('ALPE_DATABASE_LOGGING')),
  },
};
