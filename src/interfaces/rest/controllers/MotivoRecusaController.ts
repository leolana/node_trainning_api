import { Router, Response, NextFunction } from 'express';
import { Request } from 'express-request';
import { injectable, inject } from 'inversify';
import { Sequelize } from 'sequelize-typescript';

import Controller from '../Controller';
import { LoggerInterface } from '../../../infra/logging';
import { Auth } from '../../../infra/auth';
import { rolesEnum as roles } from '../../../domain/services/auth/rolesEnum';
import { typeEnum as tiposParticipante } from '../../../domain/services/participante/typeEnum';
import listEcRejectReasonsUseCase from '../../../domain/usecases/motivoRecusa/listEcRejectReasonsUseCase';
import listSupplierRejectReasonsUseCase from '../../../domain/usecases/motivoRecusa/listSupplierRejectReasonsUseCase';
import listLinkRejectReasonsUseCase from '../../../domain/usecases/motivoRecusa/listLinkRejectReasonsUseCase';

import types from '../../../constants/types';

@injectable()
class MotivoRecusaController implements Controller {
  db: Sequelize;
  logger: LoggerInterface;
  auth: Auth;

  constructor(
    @inject(types.Database) db: Sequelize,
    @inject(types.Logger) logger: LoggerInterface,
    @inject(types.AuthFactory) auth: () => Auth,
  ) {
    this.db = db;
    this.logger = logger;
    this.auth = auth();
  }

  get router(): Router {
    const router = Router();

    const requireBackoffice = this.auth.require(
      roles.boAdministrador, roles.boOperacoes
    );

    const requireParticipante = this.auth.requireParticipante(
      tiposParticipante.estabelecimento,
      tiposParticipante.fornecedor
    );

    router.get(
      '/motivo-recusa/indicacao/ec',
      requireBackoffice,
      this.obterMotivosRecusaIndicacaoEc
    );

    router.get(
      '/motivo-recusa/indicacao/fornecedor',
      requireBackoffice,
      this.obterMotivosRecusaIndicacaoFornecedor
    );

    router.get(
      '/motivo-recusa/vinculo',
      requireParticipante,
      this.obterMotivosRecusaVinculo
    );

    return router;
  }

  obterMotivosRecusaIndicacaoEc = async (req: Request, res: Response, next: NextFunction) => {
    return listEcRejectReasonsUseCase(this.db)()
      .then(data => res.send(data))
      .catch(next);
  }

  obterMotivosRecusaIndicacaoFornecedor = async (req: Request, res: Response, next: NextFunction) => {
    return listSupplierRejectReasonsUseCase(this.db)()
      .then(data => res.send(data))
      .catch(next);
  }

  obterMotivosRecusaVinculo = async (req: Request, res: Response, next: NextFunction) => {
    return listLinkRejectReasonsUseCase(this.db)()
      .then(data => res.send(data))
      .catch(next);
  }
}

export default MotivoRecusaController;
