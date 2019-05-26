import { Router, Response, NextFunction } from 'express';
import { Request } from 'express-request';
import { injectable, inject } from 'inversify';
import { DateTime } from 'luxon';
import { Sequelize } from 'sequelize-database';

import { typeEnum as tiposParticipante } from '../../../domain/services/participante/typeEnum';
import exportacao from '../../../domain/usecases/exportacao';
import Controller from '../Controller';
import { LoggerInterface } from '../../../infra/logging';
import { SiscofWrapper } from '../../../infra/siscof';
import { Auth } from '../../../infra/auth';

import types from '../../../constants/types';

@injectable()
class ExportacoesController implements Controller {
  db: Sequelize;
  auth: Auth;
  logger: LoggerInterface;
  siscofWrapper: SiscofWrapper;
  reports: any;

  constructor(
    @inject(types.Database) db: Sequelize,
    @inject(types.AuthFactory) auth: () => Auth,
    @inject(types.SiscofWrapper) siscofWrapper: SiscofWrapper,
    @inject(types.Logger) logger: LoggerInterface,
  ) {
    this.db = db;
    this.auth = auth();
    this.logger = logger;
    this.siscofWrapper = siscofWrapper;

    this.reports = exportacao(db, siscofWrapper);
  }

  get router(): Router {
    const router = Router();

    const allow = this.auth.requireParticipante(
      tiposParticipante.estabelecimento,
      tiposParticipante.fornecedor,
    );

    router.get(
      '/exportacao/verificacao',
      this.check,
    );

    router.get(
      '/exportacao',
      allow,
      this.list,
    );

    router.get(
      '/exportacao/:id',
      allow,
      this.get,
    );

    return router;
  }

  check = async (req: Request, res: Response, next: NextFunction) => this.reports
    .verify(+req.user.participante)
    .then(result => res.send({ habilitado: Boolean(result) }))
    .catch(next)

  list = async (req: Request, res: Response, next: NextFunction) => this.reports
    .search(+req.user.participante)
    .then(result => res.send(result))
    .catch(next)

  get = async (req: Request, res: Response, next: NextFunction) => {
    const reportId = +req.params.id;
    const participantId = +req.user.participante;

    const startDate = DateTime.fromISO(req.query.dataOperacaoInicial).toJSDate();
    const endDate = DateTime.fromISO(req.query.dataOperacaoFinal).toJSDate();

    return this.reports
      .export(reportId, participantId, startDate, endDate)
      .then((ret) => {
        res.set({
          'Access-Control-Expose-Headers': 'Content-Disposition',
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=${ret.filename}`,
        });

        res.write(ret.data);
        return res.end();
      })
      .catch(next);
  }
}

export default ExportacoesController;
