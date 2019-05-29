import { Router, Response, NextFunction } from 'express';
import { Request } from 'express-request';
import { injectable, inject } from 'inversify';
import { Sequelize } from 'sequelize-typescript';

import Controller from '../Controller';
import { LoggerInterface } from '../../../infra/logging';
import findCurrentByType from '../../../domain/services/termo/findCurrentByType';
import accept from '../../../domain/services/termo/accept';

import types from '../../../constants/types';

@injectable()
class TermoController implements Controller {
  db: Sequelize;
  logger: LoggerInterface;

  constructor(
    @inject(types.Database) db: Sequelize,
    @inject(types.Logger) logger: LoggerInterface,
  ) {
    this.db = db;
    this.logger = logger;
  }

  get router(): Router {
    const router = Router();

    router.get('/dominio/termo/:tipo', this.obterTermoVigentePorTipo);
    router.post('/dominio/termo/:id/aceitar', this.aceitarTermo);

    return router;
  }

  obterTermoVigentePorTipo = async (req: Request, res: Response, next: NextFunction) => {
    const tipo = +req.params.tipo;

    return findCurrentByType(this.db)(tipo)
      .then((termo) => {
        res.send(termo || {});
      })
      .catch(next);
  }

  aceitarTermo = async (req: Request, res: Response, next: NextFunction) => {
    const id = +req.params.id;
    const participanteId = +req.user.participante;
    const user = req.user.email;

    return accept(this.db)(id, participanteId, user)
      .then(() => res.end())
      .catch(next);
  }
}

export default TermoController;
