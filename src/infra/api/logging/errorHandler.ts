import { ErrorRequestHandler, Request } from 'express-serve-static-core';
import { Response, NextFunction } from 'express';

import { config } from '../../../config';
import { ApiError } from '../../../interfaces/rest/errors/ApiErrors';
import logging from '../../logging';
const sentry = require('@sentry/node');

const errorHandler: ErrorRequestHandler = (error: ApiError, req: Request, res: Response, next: NextFunction): any => {
  sentry.init({
    dsn: config.sentry.dsn,
    environment: config.sentry.environment,
  });

  sentry.captureException(error);
  logging.error(error as any);

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
