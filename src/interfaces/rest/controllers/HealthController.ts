import { Router, Response, NextFunction } from 'express';
import { Request } from 'express-request';
import { injectable, inject } from 'inversify';
import { Sequelize } from 'sequelize-database';

import Controller from '../Controller';
import credenciamentoStatusEnum from '../../../domain/entities/credenciamentoStatusEnum';
import { SiscofConnector } from '../../../infra/siscof';
import Auth from '../../../infra/auth/Auth';
import { Mailer } from '../../../infra/mailer';
import { Environment, AppEnv } from '../../../infra/environment/Environment';

import types from '../../../constants/types';
import { HealthCheckUseCases, getHealthCheckUseCases } from '../../../domain/usecases/healthCheck';

@injectable()
class HealthController implements Controller {
  siscof: SiscofConnector;
  auth: Auth;
  statusCredenciamento: any;
  mailer: Mailer;
  emailTemplates: any;
  settings: AppEnv;
  usecases: HealthCheckUseCases;

  constructor(
    @inject(types.Database) private db: Sequelize,
    @inject(types.SiscofConnectorFactory) siscof: () => SiscofConnector,
    @inject(types.AuthFactory) auth: () => Auth,
    @inject(types.MailerFactory) mailer: () => Mailer,
    @inject(types.Environment) config: Environment,
  ) {
    this.siscof = siscof();
    this.auth = auth();
    this.statusCredenciamento = credenciamentoStatusEnum;
    this.mailer = mailer();
    this.emailTemplates = this.mailer.emailTemplates;
    this.settings = config.app;
    this.usecases = getHealthCheckUseCases(db);
  }

  get router(): Router {
    const router = Router();

    router.get('/health-check', this.healthCheck);
    router.get('/health/testPostgresConnection', this.testPostgresConnection);
    router.get('/health/getStatusCessoes', this.getStatusCessoes);
    router.get('/version', this.getVersion);
    router.get('/health/migrations', this.getMigrations);

    return router;
  }

  healthCheck = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const results = await Promise.all([
        this.usecases.testPostgresConnectionUseCase(),
      ]);

      const errors = results.filter(result => result && result.message && typeof result.message === 'string');

      if (errors.length) {
        res.send({
          errors,
          result: false
        });
        return;
      }

      res.send({
        status: 'Api is running...',
        result: true,
      });
    } catch (error) {
      next(error);
    }
  }

  testPostgresConnection = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const postgres = await this.usecases.testPostgresConnectionUseCase();
      res.send({ error: postgres, result: !postgres });
    } catch (error) {
      next(error);
    }
  }

  getStatusCessoes = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    return Promise.all([
      this.db.entities.cessao.findAll({
        limit: 1,
        attributes: ['createdAt'],
        order: [['createdAt', 'DESC']]
      }),
      this.db.entities.cessao.count({})
    ])
      .then(results => res.send({
        result: true,
        latest: results[0][0] && results[0][0].createdAt,
        count: results[1]
      }))
      .catch(error => res.send({ error, result: false }));
  }

  getVersion = async (req: Request, res: Response, next: NextFunction) => {
    res.send({ result: this.settings.version });
  }

  getMigrations = async (req: Request, res: Response, next: NextFunction) => {
    const migrations = this.db.entities._migration.findAll({
      attributes: ['key', 'executedAt'],
      order: [['executedAt', 'DESC']]
    });

    migrations
      .then(results => res.send(results))
      .catch(() => res.send([]));
  }

}

export default HealthController;
