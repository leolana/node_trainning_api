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
import personTypeEnum from '../../../domain/services/participante/personTypeEnum';
import getIndicationEstablishmentUseCase from '../../../domain/usecases/fornecedor/getIndicationEstablishmentUseCase';
import updateIndicationEstablishmentUseCase from '../../../domain/usecases/fornecedor/updateIndicationEstablishmentUseCase';

import types from '../../../constants/types';
import { config } from '../../../config';

@injectable()
class FornecedoresController implements Controller {
  auth: Auth;
  db: Sequelize;
  logger: LoggerInterface;
  siscofWrapper: SiscofWrapper;
  mailer: Mailer;
  mailerSettings: any;
  fileStorage: FileStorage;
  fornecedor: ReturnType<typeof fornecedor>;
  storage = multer.memoryStorage();
  upload = multer({ storage: this.storage });

  constructor(
    @inject(types.AuthFactory) auth: () => Auth,
    @inject(types.Database) db: Sequelize,
    @inject(types.Logger) logger: LoggerInterface,
    @inject(types.SiscofWrapper) siscofWrapper: SiscofWrapper,
    @inject(types.MailerFactory) mailer: () => Mailer,
    @inject(types.FileStorageFactory) fileStorage: () => FileStorage
  ) {
    this.auth = auth();
    this.db = db;
    this.logger = logger;
    this.siscofWrapper = siscofWrapper;
    this.mailer = mailer();
    this.mailerSettings = config.mailer;
    this.fileStorage = fileStorage();

    this.fornecedor = fornecedor(
      db, siscofWrapper, this.auth, this.mailer, this.mailerSettings, this.fileStorage, this.logger
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
    const { files } = req;
    const user = req.user.email;
    const data = JSON.parse(req.body.data);

    const promise = data.id
      ? this.fornecedor.edit(data, files, user)
      : this.fornecedor.add(data, files, user);

    return promise
      .then(() => res.end())
      .catch(next);
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
      req.params.cnpjthis.Fornecedor, req.params.cnpjEstabelecimento
    )
    .then(data => res.send(data))
    .catch(next)

  getIdentifier = async (req: Request, res: Response, next: NextFunction) => this.fornecedor
    .identifier(req.params.cnpjthis.Fornecedor)
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
      const tipoPessoa = personTypeEnum.verifyPersonType(documento);
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
