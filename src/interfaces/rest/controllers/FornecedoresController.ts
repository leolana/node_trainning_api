import { Router, Response, NextFunction } from 'express';
import { Request } from 'express-request';
import { injectable, inject } from 'inversify';
import { Sequelize } from 'sequelize-database';
import * as multer from 'multer';

import Controller from '../Controller';
import { LoggerInterface } from '../../../infra/logging';
import { rolesEnum as roles } from '../../../domain/services/auth/rolesEnum';
import { Auth } from '../../../infra/auth';
import { SiscofWrapper } from '../../../infra/siscof';
import { Mailer } from '../../../infra/mailer';
import FileStorage from '../../../infra/fileStorage/FileStorage';
import { typeEnum as tiposParticipante } from '../../../domain/services/participante/typeEnum';
import fornecedor from '../../../domain/usecases/fornecedor';
import checkECIndicationUseCase from '../../../domain/usecases/estabelecimento/checkECIndicationUseCase';
import newIndicationUseCase from '../../../domain/usecases/estabelecimento/newIndicationUseCase';
import participateNominationSourceEnum from '../../../domain/entities/participateNominationSourceEnum';
import participanteVinculoStatus from '../../../domain/entities/participanteVinculoStatus';
import { verifyPersonType } from '../../../domain/services/participante/personTypeEnum';
import getIndicationEstablishmentUseCase from '../../../domain/usecases/fornecedor/getIndicationEstablishmentUseCase';
import updateIndicationEstablishmentUseCase from '../../../domain/usecases/fornecedor/updateIndicationEstablishmentUseCase';
import { MovideskUseCases, getMovideskUseCases } from '../../../domain/usecases/movidesk';
import { PersonAPI } from '../../../infra/movidesk';
import { Environment } from '../../../infra/environment/Environment';

import types from '../../../constants/types';

@injectable()
class FornecedoresController implements Controller {
  auth: Auth;
  mailer: Mailer;
  fileStorage: FileStorage;
  fornecedor: ReturnType<typeof fornecedor>;
  storage = multer.memoryStorage();
  upload = multer({ storage: this.storage });
  movideskUsecases: MovideskUseCases;

  constructor(
    @inject(types.Database) private db: Sequelize,
    @inject(types.Logger) private logger: LoggerInterface,
    @inject(types.Environment) private config: Environment,
    @inject(types.SiscofWrapper) private siscofWrapper: SiscofWrapper,

    @inject(types.AuthFactory) auth: () => Auth,
    @inject(types.MailerFactory) mailer: () => Mailer,
    @inject(types.PersonAPIFactory) personApi: () => PersonAPI,
    @inject(types.FileStorageFactory) fileStorage: () => FileStorage
  ) {

    this.auth = auth();
    this.mailer = mailer();
    this.fileStorage = fileStorage();

    this.fornecedor = fornecedor(
      this.db,
      this.siscofWrapper,
      this.auth,
      this.mailer,
      this.config.mailer,
      this.fileStorage,
      this.logger
    );

    this.movideskUsecases = getMovideskUseCases(
      this.db,
      personApi(),
      this.logger
    );
  }

  get router(): Router {
    const router = Router();

    const requireBackoffice = this.auth.require(
      roles.boAdministrador, roles.boOperacoes
    );

    router.get(
      '/fornecedores/cadastrados',
      requireBackoffice,
      this.listRegistered
    );

    router.get(
      '/fornecedores/pendentes',
      requireBackoffice,
      this.listPending
    );

    router.get(
      '/fornecedores/cancelados',
      requireBackoffice,
      this.listCanceled
    );

    router.get(
      '/fornecedores/getById/:id',
      requireBackoffice,
      this.get
    );

    router.get(
      '/fornecedores/tarifas',
      this.auth.requireParticipante(tiposParticipante.fornecedor),
      this.getTariffs
    );

    router.post(
      '/fornecedores',
      this.upload.any(),
      requireBackoffice,
      this.mutate
    );

    router.post(
      '/fornecedores/solicitarCessao',
      this.auth.requireParticipante(tiposParticipante.fornecedor),
      this.requestCession
    );

    router.post(
      '/fornecedores/recusarIndicacao',
      requireBackoffice,
      this.rejectNomination
    );

    router.get(
      '/fornecedor/:cnpjFornecedor/estabelecimento/:cnpjEstabelecimento/',
      this.auth.requireParticipante(tiposParticipante.fornecedor),
      this.listIdentifiers
    );

    router.get(
      '/fornecedor/:cnpjFornecedor/estabelecimento/',
      this.auth.requireParticipante(tiposParticipante.fornecedor),
      this.getIdentifier
    );

    router.get(
      '/fornecedor/:id/vinculos',
      requireBackoffice,
      this.getProviderEstablishment
    );

    router.get(
      '/fornecedor/checa-documento-indicacao-estabelecimento/:documento',
      this.auth.requireParticipante(tiposParticipante.fornecedor),
      this.checkDocumentIndicationEstablishment
    );

    router.post(
      '/fornecedor/indicar-estabelecimento',
      this.auth.requireParticipante(tiposParticipante.fornecedor),
      this.indicacao
    );

    router.get(
      '/fornecedor/indicacao-estabelecimento',
      this.auth.requireParticipante(tiposParticipante.fornecedor),
      this.getIndicationEstablishment
    );

    router.post(
      '/fornecedor/indicacao-estabelecimento',
      this.auth.requireParticipante(tiposParticipante.fornecedor),
      this.updateIndicationEstablishment
    );

    return router;
  }

  listRegistered = async (req: Request, res: Response, next: NextFunction) => this.fornecedor
    .searchRegistered(req.query)
    .then(data => res.send(data))
    .catch(next)

  listPending = async (req: Request, res: Response, next: NextFunction) => this.fornecedor
    .searchPending(req.query)
    .then(data => res.send(data))
    .catch(next)

  listCanceled = async (req: Request, res: Response, next: NextFunction) => this.fornecedor
    .searchCanceled(req.query)
    .then(data => res.send(data))
    .catch(next)

  get = async (req: Request, res: Response, next: NextFunction) => this.fornecedor
    .details(+req.params.id)
    .then(data => res.send(data))
    .catch(next)

  getTariffs = async (req: Request, res: Response, next: NextFunction) => this.fornecedor
    .tariffs(+req.user.participante)
    .then(data => res.send(data))
    .catch(next)

  mutate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { files } = req;
      const userEmail = req.user.email;
      const data = JSON.parse(req.body.data);

      if (data.id) {
        await this.fornecedor.edit(data, files, userEmail);

      } else {

        const participantId = await this.fornecedor.add(
          data,
          files,
          userEmail
        );

        const throwErrors = false;

        await this.movideskUsecases.forceMovideskPersonIntegration(
          participantId,
          userEmail,
          throwErrors
        );
      }

      res.end();

    } catch (error) {
      next(error);
    }
  }

  requestCession = async (req: Request, res: Response, next: NextFunction) => {
    const linkId = +req.body.vinculoId;
    const { tipo } = req.body;

    try {
      const cessionId = await this.fornecedor.requestCession(req.body, linkId, tipo, req.user);
      res.send({ id: cessionId });
    } catch (err) { next(err); }
  }

  rejectNomination = async (req: Request, res: Response, next: NextFunction) => this.fornecedor
    .rejectNomination(req.body.documento, req.body.motivoTipoRecusaId, req.body.motivo, req.user.email)
    .then(() => res.end())
    .catch(next)

  listIdentifiers = async (req: Request, res: Response, next: NextFunction) => this.fornecedor
    .searchIdentifiers(
      req.params.cnpjFornecedor, req.params.cnpjEstabelecimento
    )
    .then(data => res.send(data))
    .catch(next)

  getIdentifier = async (req: Request, res: Response, next: NextFunction) => this.fornecedor
    .identifier(req.params.cnpjFornecedor)
    .then(data => res.send(data))
    .catch(next)

  getProviderEstablishment = async (req: Request, res: Response, next: NextFunction) => this.fornecedor
    .myEstablishments(+req.params.id)
    .then(data => res.send(data))
    .catch(next)

  checkDocumentIndicationEstablishment = async (req: Request, res: Response, next: NextFunction) => {
    const { documento } = req.params;
    const fornecedorId = +req.user.participante;

    return checkECIndicationUseCase(this.db)(fornecedorId, documento)
      .then(obj => res.send(obj))
      .catch(next);
  }

  indicacao = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fornecedorId = +req.user.participante;

      const {
        documento,
        nome,
        email,
        telefone,
      } = req.body;
      const usuario = req.user.email;
      const tipoPessoa = verifyPersonType(documento);
      const canalEntrada = req.user.participanteFornecedor
        ? participateNominationSourceEnum.indicacaoPorFornecedor
        : participateNominationSourceEnum.indicacaoPorEc;

      await newIndicationUseCase(this.db)(
        fornecedorId,
        documento,
        nome,
        email,
        telefone,
        usuario,
        tipoPessoa,
        canalEntrada,
        participanteVinculoStatus.pendente,
      );
      return res.end();
    } catch (error) {
      return next(error);
    }
  }

  getIndicationEstablishment = async (req: Request, res: Response, next: NextFunction) => {
    const indicacaoId = +req.query.id;
    const participanteId = +req.user.participante;

    return getIndicationEstablishmentUseCase(this.db)(indicacaoId, participanteId)
      .then(indicacao => res.send(indicacao))
      .catch(next);
  }

  updateIndicationEstablishment = async (req: Request, res: Response, next: NextFunction) => {
    const participanteId = +req.user.participante;
    const usuario = req.user.email;

    return updateIndicationEstablishmentUseCase(this.db)(
      +req.body.id,
      participanteId,
      req.body.documento,
      req.body.nome,
      req.body.email,
      req.body.telefone,
      usuario,
    )
      .then(indicacao => res.send(indicacao))
      .catch(next);
  }
}

export default FornecedoresController;
