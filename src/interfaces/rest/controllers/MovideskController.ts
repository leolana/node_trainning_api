import { Router, Response, NextFunction } from 'express';
import { Request } from 'express-request';
import { injectable, inject } from 'inversify';
import { Sequelize } from 'sequelize-database';

import { PersonAPI } from '../../../infra/movidesk';
import { LoggerInterface } from '../../../infra/logging';
import { MovideskUseCases, getMovideskUseCases } from '../../../domain/usecases/movidesk';

import Controller from '../Controller';
import Auth from '../../../infra/auth/Auth';
import types from '../../../constants/types';

@injectable()
class MovideskController implements Controller {
  auth: Auth;
  usecases: MovideskUseCases;

  constructor(
    @inject(types.Database) private db: Sequelize,
    @inject(types.Logger) private logger: LoggerInterface,

    @inject(types.AuthFactory) auth: () => Auth,
    @inject(types.PersonAPIFactory) personAPI: () => PersonAPI
  ) {

    this.auth = auth();

    this.usecases = getMovideskUseCases(
      this.db,
      personAPI(),
      this.logger
    );
  }

  get router(): Router {
    const router = Router();
    router.get('/movidesk-chatbox-token', this.checkParticipantAccessToChatbox);
    router.post('/movidesk-integration', this.forceMovideskPersonIntegration);
    return router;
  }

  checkParticipantAccessToChatbox = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = {
        integrado: false,
        uuidIntegracao: null,
        participanteId: null,
        email: null,
        nome: null
      };

      res.send(result);

    } catch (error) {
      next(error);
    }
  }

  forceMovideskPersonIntegration = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.end();
    } catch (error) {
      next(error);
    }
  }
}

export default MovideskController;
