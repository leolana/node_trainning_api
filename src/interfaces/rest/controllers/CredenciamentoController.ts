import { Router, Response, NextFunction } from 'express';
import { Request } from 'express-request';
import { injectable, inject } from 'inversify';
import { Sequelize } from 'sequelize-database';
import * as multer from 'multer';

import Controller from '../Controller';
import { LoggerInterface } from '../../../infra/logging';
import { getCredenciamentoUseCases, CredenciamentoUseCases } from '../../../domain/usecases/credenciamento';
import credenciamentoStatusEnum from '../../../domain/entities/credenciamentoStatusEnum';
import Auth from '../../../infra/auth/Auth';
import FileStorage from '../../../infra/fileStorage/FileStorage';
import { Mailer } from '../../../infra/mailer';
import { SiscofWrapper } from '../../../infra/siscof';
import { PersonAPI } from '../../../infra/movidesk/PersonAPI';
import { rolesEnum as roles } from '../../../domain/services/auth/rolesEnum';
import deformatDocument from '../../../domain/services/credenciamento/deformatDocument';
import { MovideskUseCases, getMovideskUseCases } from '../../../domain/usecases/movidesk';
import { Environment, MailerEnv } from '../../../infra/environment/Environment';

import types from '../../../constants/types';

@injectable()
class CredenciamentoController implements Controller {
  auth: Auth;
  fileStorage: FileStorage;
  mailer: Mailer;
  usecases: CredenciamentoUseCases;
  movideskUsecases: MovideskUseCases;
  mailerSettings: MailerEnv;
  storage = multer.memoryStorage();
  upload = multer({ storage: this.storage });

  constructor(
    @inject(types.Database) private db: Sequelize,
    @inject(types.Logger) private logger: LoggerInterface,
    @inject(types.AuthFactory) auth: () => Auth,
    @inject(types.FileStorageFactory) fileStorage: () => FileStorage,
    @inject(types.SiscofWrapper) private siscofWrapper: SiscofWrapper,
    @inject(types.MailerFactory) mailer: () => Mailer,
    @inject(types.Environment) config: Environment,
    @inject(types.PersonAPIFactory) personApi: () => PersonAPI,
  ) {
    this.mailerSettings = config.mailer;
    this.auth = auth();
    this.fileStorage = fileStorage();
    this.mailer = mailer();

    this.usecases = getCredenciamentoUseCases(
      this.db,
      this.auth,
      this.fileStorage,
      this.siscofWrapper,
      this.mailer,
      this.mailerSettings,
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

    router.get(
      '/credenciamento',
      this.auth.require(roles.boAdministrador, roles.boOperacoes),
      this.list
    );
    router.get(
      '/credenciamento/export',
      this.auth.require(roles.boAdministrador, roles.boOperacoes),
      this.exportCSV
    );
    router.get(
      '/credenciamento/:id',
      this.auth.require(roles.boAdministrador, roles.boOperacoes),
      this.get
    );
    router.get(
      '/credenciamentoIndicacao/:documento',
      this.auth.require(roles.boAdministrador, roles.boOperacoes),
      this.getFromIndicacao
    );
    router.post(
      '/credenciamento',
      this.upload.any(),
      this.auth.require(roles.boAdministrador, roles.boOperacoes),
      this.mutate
    );
    router.post(
      '/credenciamento/analise',
      this.upload.any(),
      this.auth.require(roles.boAdministrador, roles.boOperacoes),
      this.editAnalyze
    );
    router.post(
      '/credenciamento/:id/analisar',
      this.auth.require(roles.boAdministrador, roles.boOperacoes),
      this.analyze
    );
    router.post(
      '/credenciamento/:id/aprovar',
      this.auth.require(roles.boAdministrador, roles.boOperacoes),
      this.approve
    );
    router.post(
      '/credenciamento/:id/recusar',
      this.auth.require(roles.boAdministrador, roles.boOperacoes),
      this.reject
    );
    router.post(
      '/credenciamento/:id/arquivos/analise',
      this.upload.any(),
      this.auth.require(roles.boAdministrador, roles.boOperacoes),
      this.addAnalysisFile
    );
    router.get(
      '/credenciamento/:documento/arquivos/:tipo/:indice',
      this.auth.require(roles.boAdministrador, roles.boOperacoes),
      this.getAccreditationFile
    );
    router.get(
      '/credenciamento/extratos/:reportId',
      this.auth.require(roles.boAdministrador, roles.boOperacoes),
      this.getReportFile
    );
    router.get(
      '/credenciamentoProposta/:documento/arquivos/:tipo/:indice',
      this.auth.require(roles.boAdministrador, roles.boOperacoes),
      this.getSuggestionFile
    );
    router.post(
      '/credenciamento/pre-cadastro',
      this.auth.require(roles.fcAdministrador, roles.fcFinanceiro, roles.fcComercial),
      this.upload.any(),
      this.addSuggestion
    );
    router.get(
      '/checa-existencia-documento',
      this.auth.require(roles.boAdministrador, roles.boOperacoes),
      this.checkDocumentExistence
    );

    return router;
  }

  private sendBlobResponse = (data, res) => {
    res.set({
      'Access-Control-Expose-Headers': 'Content-Disposition',
      'Content-Type': data.ContentType,
      'Content-Disposition': `attachment; filename=${data.filename}`,
    });

    res.write(data.Body);
    return res.end();
  }

  list = async (req: Request, res: Response, next: NextFunction) => {
    return this.usecases
      .search(req.query)
      .then(results => res.send(results))
      .catch(next);
  }

  exportCSV = async (req: Request, res: Response, next: NextFunction) => {
    return this.usecases
      .exportCSV(req.query)
      .then(csv => this.sendBlobResponse({ Body: csv, ContentType: 'text/csv', filename: 'credenciamento.csv' }, res))
      .catch(next);
  }

  get = async (req: Request, res: Response, next: NextFunction) => {
    return this.usecases
      .details(+req.params.id)
      .then(results => res.send(results))
      .catch(next);
  }

  getFromIndicacao = async (req: Request, res: Response, next: NextFunction) => {
    return this.usecases
      .getIdFromDocument(deformatDocument(req.params.documento))
      .then(results => res.send(results))
      .catch(next);
  }

  mutate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { files } = req;
      const user = req.user.email;
      const data = JSON.parse(req.body.data);

      const { documento } = data.dadosCadastrais;

      if (data.dadosCadastrais.id) {
        const unchangedFiles = req.body.unchangedFiles && JSON.parse(req.body.unchangedFiles);
        await this.usecases.edit(data, files, documento, user, unchangedFiles);
      } else {
        await this.usecases.addAccreditation(data, files, documento, user);
      }

      res.end();
    } catch (error) {
      next(error);
    }
  }

  editAnalyze = async (req: Request, res: Response, next: NextFunction) => {
    const { files } = req;
    const user = req.user.email;
    const data = JSON.parse(req.body.data);

    const { documento } = data.dadosCadastrais;

    let unchangedFiles = null;

    if (req.body.unchangedFiles) {
      unchangedFiles = JSON.parse(req.body.unchangedFiles);
    }

    return this.usecases.editAnalyze(data, files, documento, user, unchangedFiles)
      .then(() => res.end())
      .catch(next);
  }

  analyze = async (req: Request, res: Response, next: NextFunction) => {
    const credenciamentoId = +req.params.id;

    return this.usecases.canAnalyze(credenciamentoId)
      .then(() => this.usecases.changeStatus(
        credenciamentoId,
        req.user.email,
        credenciamentoStatusEnum.emAnalise,
      ))
      .then(results => res.send(results))
      .catch(next);
  }

  reject = async (req: Request, res: Response, next: NextFunction) => {
    const credenciamentoId = +req.params.id;

    return this.usecases.canReject(credenciamentoId)
      .then(() => this.usecases.changeStatus(
        credenciamentoId,
        req.user.email,
        credenciamentoStatusEnum.reprovado,
      ))
      .then(results => res.send(results))
      .catch(next);
  }

  approve = async (req: Request, res: Response, next: NextFunction) => {
    const credenciamentoId = +req.params.id;
    const user = req.user.email;

    return this.usecases.canApprove(credenciamentoId)
      .then(() => this.usecases.approve(credenciamentoId, user))
      .then((credenciamento: any) => this.movideskUsecases
        .forceMovideskPersonIntegration(credenciamento.participanteId, user, false)
        .then(() => res.send(credenciamento))
      )
      .catch(next);
  }

  addAnalysisFile = async (req: Request, res: Response, next: NextFunction) => {
    const id = +req.params.id;
    const user = req.user.email;
    const { files } = req;
    const data = JSON.parse(req.body.data);

    return this.usecases
      .addAnalysisFile(id, files, data, user)
      .then(filesAnalisados => res.send(filesAnalisados))
      .catch(next);
  }

  addSuggestion = async (req: Request, res: Response, next: NextFunction) => {
    const document = req.body.documento;
    const participantId = +req.user.participante;
    const personType = +req.body.tipoPessoa;
    const name = req.body.nome;
    const user = req.user.email;
    const { files } = req;

    return this.usecases
      .suggest(participantId, document, name, personType, files, user)
      .then(() => res.end())
      .catch(next);
  }

  getAccreditationFile = async (req: Request, res: Response, next: NextFunction) => {
    const type = req.params.tipo;
    const index = req.params.indice;
    const document = req.params.documento;

    return this.usecases.fetchFile
      .accreditation(type, index, document)
      .then(data => this.sendBlobResponse(data, res))
      .catch(() => {
        throw new Error(`download-${req.params.tipo}`);
      });
  }

  getReportFile = async (req: Request, res: Response, next: NextFunction) => {
    const reportId = req.params.reportId;

    return this.usecases.fetchReportFile(reportId)
      .then(data => this.sendBlobResponse(data, res))
      .catch(() => {
        throw new Error(`download-${req.params.tipo}`);
      });
  }

  getSuggestionFile = async (req: Request, res: Response, next: NextFunction) => {
    const type = req.params.tipo;
    const index = req.params.indice;
    const document = req.params.documento;

    return this.usecases.fetchFile
      .suggestion(type, index, document)
      .then(data => this.sendBlobResponse(data, res))
      .catch(() => {
        throw new Error(`download-${req.params.tipo}`);
      });
  }

  checkDocumentExistence = async (req: Request, res: Response, next: NextFunction) => {
    const { documento } = req.query;

    return this.usecases.checkDocumentExistence(documento)
      .then(data => res.send(data))
      .catch(next);
  }
}

export default CredenciamentoController;
