import { Router, Response, NextFunction } from 'express';
import { Request } from 'express-request';
import { injectable, inject } from 'inversify';
import { Sequelize } from 'sequelize-database';

import { LoggerInterface } from '../../../infra/logging';
import { PersonAPI } from '../../../infra/movidesk';
import Auth from '../../../infra/auth/Auth';

import { typeEnum as tiposParticipante } from '../../../domain/services/participante/typeEnum';
import { MovideskUseCases, getMovideskUseCases } from '../../../domain/usecases/movidesk';
import types from '../../../constants/types';
import { config } from '../../../config';
import Controller from '../Controller';

@injectable()
class MovideskController implements Controller {
  auth: Auth;
  usecases: MovideskUseCases;

  constructor(
    @inject(types.AuthFactory) auth: () => Auth,
    @inject(types.PersonAPIFactory) personAPI: () => PersonAPI,
    @inject(types.Database) private db: Sequelize,
    @inject(types.Logger) private logger: LoggerInterface,
  ) {
    this.auth = auth();
    this.usecases = getMovideskUseCases(this.db, personAPI(), this.logger);
  }

  get router(): Router {
    const router = Router();
    router.get('/movidesk-chatbox-token', this.obterChatboxToken);
    router.post('/movidesk-integration', this.forceMovideskIntegration);
    return router;
  }

  obterChatboxToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let token: string = null;

      if (this.auth.isParticipante(req, tiposParticipante.estabelecimento, tiposParticipante.fornecedor)) {
        const participanteId = +req.user.participante;
        const integrado = await this.usecases.checkParticipantMovideskIntegrationUseCase(participanteId);

        if (integrado) {
          token = config.movidesk.token;
        }
      }

      return res.send({ token });
    } catch (e) {
      return next(e);
    }
  }

  forceMovideskIntegration = async (req: Request, res: Response, next: NextFunction) => {
    const participanteId = +req.body.participanteId;
    const user = req.user.email;

    try {
      await this.usecases.integrateWithMovideskUseCase(participanteId, user);
      return res.end();
    } catch (e) {
      return next(e);
    }
  }
}

export default MovideskController;
