import { ErrorRequestHandler, Request } from 'express-serve-static-core';
import { Response, NextFunction } from 'express';
import * as sentry from '@sentry/node';

import { ApiError } from '../../../interfaces/rest/errors/ApiErrors';
import { Environment } from '../../../infra/environment/Environment';
import { LoggerInterface } from '../../logging';

import container from '../../../container';
import types from '../../../constants/types';

const errorHandler: ErrorRequestHandler = (error: ApiError, req: Request, res: Response, next: NextFunction): any => {
  const config = container.get<Environment>(types.Environment);
  const logger = container.get<LoggerInterface>(types.Logger);

  sentry.init({
    dsn: config.sentry.dsn,
    environment: config.sentry.environment,
  });

  sentry.captureException(error);
  logger.error(error as any);

  const response: any = {
    message: error.message,
    status: error.status
  };

  if (config.isDevelopment) {
    response.stack = error.stack;
  }

  res.status(response.status).send(response);

  next();
};

export default errorHandler;
