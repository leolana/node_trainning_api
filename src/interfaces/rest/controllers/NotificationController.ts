import { Router, Response, NextFunction } from 'express';
import { Request } from 'express-request';
import { injectable, inject } from 'inversify';

import { getNotificationUseCases, NotificationUseCases } from '../../../domain/usecases/notificacoes';

import Controller from '../Controller';
import Auth from '../../../infra/auth/Auth';
import { rolesEnum as roles } from '../../../domain/services/auth/rolesEnum';

import types from '../../../constants/types';
import { Sequelize } from 'sequelize-database';
import { LoggerInterface } from '../../../infra/logging';

@injectable()
class NotificationController implements Controller {
  auth: Auth;
  usecases: NotificationUseCases;

  constructor(
    @inject(types.Database) private db: Sequelize,
    @inject(types.AuthFactory) auth: () => Auth,
    @inject(types.Logger) private logger: LoggerInterface,
  ) {
    this.auth = auth();
    this.usecases = getNotificationUseCases(this.db, this.logger);
  }

  get router(): Router {
    const requireBackoffice = this.auth.require(
      roles.boAdministrador, roles.boOperacoes);

    const router = Router();

    router.get(
      '/notification',
      requireBackoffice,
      this.obterNotificacoes);

    router.get(
      '/notifications-bullets',
      requireBackoffice,
      this.obterNotificacoesNaolidas);
    return router;
  }

  obterNotificacoes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = +req.query.limit;
      const page = limit * (+req.query.page - 1);
      const user = req.user;

      const notifications = await this.usecases.getNotificatons(page, limit, user);
      await this.usecases.updateNonRead(notifications);

      return res.send(notifications);
    } catch (e) {
      return next(e);
    }
  }

  obterNotificacoesNaolidas = async (req: Request, res: Response, next: NextFunction) => {
    const userEmail = req.user.email;

    return this.usecases
      .getNotificationNonRead(userEmail)
      .then(notifications => res.send(notifications))
      .catch(next);
  }
}

export default NotificationController;
