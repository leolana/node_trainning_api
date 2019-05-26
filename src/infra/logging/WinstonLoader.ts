import { createLogger, format, transports, Logger } from 'winston';

import { Environment } from '../environment/Environment';

export const winstonLoader = (config: Environment): Logger => {
  const logger = createLogger({
    transports: [
      new transports.Console({
        level: config.log.level,
        handleExceptions: true,
        format: config.isDevelopment
          ? format.combine(format.colorize(), format.simple())
          : format.combine(format.timestamp(), format.json()),
      }),
    ],
    exceptionHandlers: [
      new transports.Console({
        handleExceptions: true,
        format: config.isDevelopment
          ? format.combine(format.colorize(), format.simple())
          : format.combine(format.timestamp(), format.json()),
      }),
    ],
    exitOnError: false,
  });

  return logger;
};
