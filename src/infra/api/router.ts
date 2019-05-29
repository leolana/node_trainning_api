import { Router } from 'express';
import * as statusMonitor from 'express-status-monitor';
import * as cors from 'cors';
import { json, urlencoded } from 'body-parser';
import * as compression from 'compression';
import * as expressValidator from 'express-validator';
import * as flash from 'express-flash';
import * as helmet from 'helmet';
import * as morgan from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as expressJWT from 'express-jwt';

import errorHandler from './logging/errorHandler';
// import autho from '../../interfaces/rest/middlewares/autho';
import ControllerLoader from './ControllerLoader';
import { unless } from '../../interfaces/rest/middlewares/unlessRoutes';
import { Environment } from '../environment/Environment';

import container from '../../container';
import types from '../../constants/types';

const router = () => {
  const config = container.get<Environment>(types.Environment);
  const params = { secret: config.auth.publicKey };
  const appRouter = Router();

  appRouter.use(statusMonitor());

  const apiRouter = Router();

  apiRouter
    .use(cors())
    .use(json())
    .use(urlencoded({ extended: true }))
    .use(cookieParser())
    .use(compression())
    .use(expressValidator())
    .use(helmet())
    .use(morgan('tiny')) // add: nas variaveis de ambiente
    .use(flash())
    .use(expressJWT(params).unless(unless))
    // .use(autho)
    .use('/', ControllerLoader.load())
    .use(errorHandler);
    // .use('/swagger', swaggerMiddleware);

  appRouter.use('/', apiRouter);

  return appRouter;
};

export default router;
