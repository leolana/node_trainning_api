import { Router, Response, NextFunction } from 'express';
import { Request } from 'express-request';
import { injectable, inject } from 'inversify';
import { Sequelize } from '../../../types/sequelize-database';

import Controller from '../Controller';
import { LoggerInterface } from '../../../infra/logging';
import { typeEnum } from '../../../domain/services/participante/typeEnum';
import checkProviderIndicationUseCase from '../../../domain/usecases/estabelecimento/checkProviderIndicationUseCase';
import { Auth } from '../../../infra/auth';

import types from '../../../constants/types';

@injectable()
class EstabelecimentoController implements Controller {
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

    router.get(
      '/estabelecimento/checa-documento-indicacao-fornecedor/:documento',
      this.auth.requireParticipante(typeEnum.estabelecimento),
      this.checkDocumentIndicationProvider
    );

    return router;
  }

  checkDocumentIndicationProvider = async (req: Request, res: Response, next: NextFunction) => {
    const { documento } = req.params;
    const estabelecimentoId = +req.user.participante;

    return checkProviderIndicationUseCase(this.db)(estabelecimentoId, documento)
      .then(obj => res.send(obj))
      .catch(next);
  }
}

export default EstabelecimentoController;
