const restify = require('restify');
const restifyJWT = require('restify-jwt');
const jwt = require('jsonwebtoken');
const corsMiddleware = require('restify-cors-middleware');
const sentry = require('@sentry/node');
const httpStatus = require('http-status-codes');

const errorHandler = (app, logger, sentrySettings) => {
  sentry.init({
    dsn: sentrySettings.dsn,
    environment: sentrySettings.environment,
  });

  const internalServerError = (res, error) => {
    logger.error(error);
    sentry.captureException(error);
    res.send(httpStatus.INTERNAL_SERVER_ERROR, JSON.stringify(error));
  };

  app.use((req, res, next) => {
    res.catch = (error) => {
      if (typeof (error) === 'string') {
        res.send(httpStatus.PRECONDITION_FAILED, error);
      } else {
        internalServerError(res, error);
      }
    };
    next();
  });

  app.on('uncaughtException', (req, res, route, error) => {
    internalServerError(res, error);
  });
};

const server = (authSettings, logger, sentrySettings) => {
  const app = restify.createServer();

  app.use(restify.plugins.queryParser());
  app.use(restify.plugins.bodyParser());

  const cors = corsMiddleware({
    origins: ['*'],
    allowHeaders: ['Authorization', 'SessionToken'],
  });

  app.pre(cors.preflight);
  app.use(cors.actual);

  const params = { secret: authSettings.publicKey };
  const unless = {
    path: [
      '/signin',
      '/signout',
      '/change-password',
      '/recover-password',
      '/reset-password',
      '/register',
      '/siscofPing',
      '/siscofDate',
      '/health-check',
    ],
  };

  app.use(restifyJWT(params).unless(unless));

  const unlessSession = [
    ...unless.path,
    '/memberships',
    '/initiate-session',
    '/initiate-gateway',
  ];

  app.use((req, res, next) => {
    if (unlessSession.includes(req.route.path)) {
      next();
    } else {
      jwt.verify(
        req.headers.sessiontoken,
        authSettings.clientSecret,
        (err, decoded) => {
          if (err) {
            res.send(500, 'invalid-credentials');
          } else {
            Object.assign(req.user, decoded);
            next();
          }
        },
      );
    }
  });

  errorHandler(app, logger, sentrySettings);

  return Promise.resolve(app);
};

const initServer = (app, logger) => {
  app.listen(process.env.PORT || 8081, () => {
    logger.info(`${app.name} listening at ${app.url}`);
  });
};

module.exports = (di) => {
  di
    .provide('$server', '@auth-settings', '$logger', '@sentry-settings', server)
    .init('$server', '$logger', initServer);
};
