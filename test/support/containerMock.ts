import { Logger as WinstonLogger } from 'winston';

import container from '../../src/container';
import { LoggerMock } from './logging/LoggerMock';
import database from './database';

import types from '../../src/constants/types';

jest.mock('winston');

const mockedLogger = jest.fn(() => ({
  log: jest.fn()
}));

container.rebind(types.Logger).toConstantValue(new LoggerMock(mockedLogger as unknown as WinstonLogger));
container.rebind(types.Database).toConstantValue(database);

export default container;
