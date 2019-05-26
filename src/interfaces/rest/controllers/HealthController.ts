import { Router, Response, NextFunction } from 'express';
import { Request } from 'express-request';
import { injectable, inject } from 'inversify';
import { Sequelize } from 'sequelize-database';

import Controller from '../Controller';
import credenciamentoStatusEnum from '../../../domain/entities/credenciamentoStatusEnum';
import { SiscofConnector } from '../../../infra/siscof';
import Auth from '../../../infra/auth/Auth';
import { Mailer } from '../../../infra/mailer';
import { config } from '../../../config';

import types from '../../../constants/types';
import { HealthCheckUseCases, getHealthCheckUseCases } from '../../../domain/usecases/healthCheck';

@injectable()
class HealthController implements Controller {
  db: Sequelize;
  siscof: SiscofConnector;
  auth: Auth;
  statusCredenciamento: any;
  mailer: Mailer;
  emailTemplates: any;
  usecases: HealthCheckUseCases;

  constructor(
    @inject(types.Database) db: Sequelize,
    @inject(types.SiscofConnectorFactory) siscof: () => SiscofConnector,
    @inject(types.AuthFactory) auth: () => Auth,
    @inject(types.MailerFactory) mailer: () => Mailer,
  ) {
    this.db = db;
    this.siscof = siscof();
    this.auth = auth();
    this.statusCredenciamento = credenciamentoStatusEnum;
    this.mailer = mailer();
    this.emailTemplates = this.mailer.emailTemplates;
    this.usecases = getHealthCheckUseCases(db, siscof(), auth());
  }

  get router(): Router {
    const router = Router();

    router.get('/health-check', this.healthCheck);
    router.get('/health/testPostgresConnection', this.testPostgresConnection);
    router.get('/health/testOracleConnection', this.testOracleConnection);
    router.get('/health/testKeyCloakAccess', this.testKeyCloakAccess);
    router.post('/health/testMailer', this.testMailer);
    router.get('/health/getStatusCredenciamentos', this.getStatusCredenciamentos);
    router.get('/health/getStatusFornecedores', this.getStatusFornecedores);
    router.get('/health/getStatusCessoes', this.getStatusCessoes);
    router.get('/health/getStatusSignins', this.getStatusSignins);
    router.get('/version', this.getVersion);
    router.get('/health/migrations', this.getMigrations);

    return router;
  }

  healthCheck = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const results = await Promise.all([
        this.usecases.testPostgresConnectionUseCase(),
        this.usecases.testOracleConnectionUseCase(),
        this.usecases.testKeyCloakAccessUseCase()
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
        result: true
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

  testOracleConnection = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const oracle = await this.usecases.testOracleConnectionUseCase();
      res.send({ error: oracle, result: !oracle });
    } catch (error) {
      next(error);
    }
  }

  testKeyCloakAccess = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const keyCloak = await this.usecases.testKeyCloakAccessUseCase();
      res.send({ error: keyCloak, result: !keyCloak });
    } catch (error) {
      next(error);
    }
  }

  testMailer = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    return this.mailer.enviar({
      templateName: this.emailTemplates.EMAIL_TESTE,
      destinatary: req.body.to,
      substitutions: {}
    })
      .then(result => res.send({ result: true }))
      .catch(error => res.send({ error, result: false }));
  }

  getStatusCredenciamentos = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    return Promise.all([
      this.db.entities.credenciamento.findAll({
        limit: 1,
        attributes: ['createdAt'],
        where: {
          status: this.statusCredenciamento.aprovado
        },
        order: [['createdAt', 'DESC']]
      }),
      this.db.entities.credenciamento.count({
        where: {
          status: this.statusCredenciamento.aprovado
        }
      })
    ])
      .then(results => res.send({
        result: true,
        latest: results[0][0] && results[0][0].createdAt,
        count: results[1]
      }))
      .catch(error => res.send({ error, result: false }));
  }

  getStatusFornecedores = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    return Promise.all([
      this.db.entities.participanteFornecedor.findAll({
        limit: 1,
        attributes: ['createdAt'],
        order: [['createdAt', 'DESC']]
      }),
      this.db.entities.participanteFornecedor.count({})
    ])
      .then(results => res.send({
        result: true,
        latest: results[0][0] && results[0][0].createdAt,
        count: results[1]
      }))
      .catch(error => res.send({ error, result: false }));
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

  getStatusSignins = async (req: Request, res: Response, next: NextFunction) => {
    res.send({ result: false, error: 'Não implementado!' });
  }

  getVersion = async (req: Request, res: Response, next: NextFunction) => {
    res.send({ result: config.app.version });
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
