// tslint:disable:no-magic-numbers
import { Router, Response, NextFunction } from 'express';
import { Request } from 'express-request';
import { injectable, inject } from 'inversify';
import { Sequelize } from 'sequelize-typescript';

import Controller from '../Controller';
import { LoggerInterface } from '../../../infra/logging';
import { typeEnum as tiposParticipante, typeEnum } from '../../../domain/services/participante/typeEnum';
import fetchFile from '../../../domain/services/participante/fetchFile';
import Auth from '../../../infra/auth/Auth';
import FileStorage from '../../../infra/fileStorage/FileStorage';
import { Mailer } from '../../../infra/mailer';
import { SiscofWrapper } from '../../../infra/siscof';
import { rolesEnum as roles } from '../../../domain/services/auth/rolesEnum';
import rejectNominationService from '../../../domain/services/participante/rejectNominationService';
import { Environment, MailerEnv } from '../../../infra/environment/Environment';

import types from '../../../constants/types';
import participanteIndicacaoStatus from '../../../domain/entities/participanteIndicacaoStatus';
import { verifyPersonType } from '../../../domain/services/types/personTypeEnum';
import participateNominationSourceEnum from '../../../domain/entities/participateNominationSourceEnum';
import participanteVinculoStatus from '../../../domain/entities/participanteVinculoStatus';
import { getIndicacaoUseCases, IndicacaoUseCase } from '../../../domain/usecases/indicacao';

@injectable()
class ParticipantesController implements Controller {
  auth: Auth;
  fileStorage: FileStorage;
  mailer: Mailer;
  mailerSettings: MailerEnv;
  fetchFile: (type: any, index: any, document: any, id: any) => Promise<any>;
  emailTemplates: any;
  indicacoesEc: (options: any) => Promise<any>;
  useCasesIndicacao: IndicacaoUseCase;
  reprovarIndicacaoService: (participanteId: any, motivoTipoRecusaId: any, motivo: any, usuario: any) => any;

  constructor(
    @inject(types.Database) private db: Sequelize,
    @inject(types.Logger) private logger: LoggerInterface,
    @inject(types.AuthFactory) auth: () => Auth,
    @inject(types.FileStorageFactory) fileStorage: () => FileStorage,
    @inject(types.SiscofWrapper) private siscofWrapper: SiscofWrapper,
    @inject(types.MailerFactory) mailer: () => Mailer,
    @inject(types.Environment) private config: Environment,
  ) {
    this.auth = auth();
    this.fileStorage = fileStorage();
    this.mailer = mailer();
    this.emailTemplates = this.mailer.emailTemplates;
    this.mailerSettings = this.config.mailer;

    this.fetchFile = fetchFile(this.db, this.fileStorage);
    this.reprovarIndicacaoService = rejectNominationService(this.db);

    this.useCasesIndicacao = getIndicacaoUseCases(
      this.db, this.siscofWrapper, this.mailer, this.mailerSettings, this.logger);
  }

  get router(): Router {
    const router = Router();
    const requireBackoffice = this.auth.require(
      roles.boAdministrador, roles.boOperacoes
    );
    const requireFornecedor = this.auth.require(
      roles.boAdministrador,
      roles.boOperacoes,
      roles.fcAdministrador,
      roles.fcFinanceiro,
      roles.fcComercial
    );
    const requireEstabelecimento = this.auth.require(
      roles.boAdministrador,
      roles.boOperacoes,
      roles.ecAdministrador,
      roles.ecFinanceiro,
      roles.ecCompras
    );
    const somenteEstabelecimento = this.auth.requireParticipante(tiposParticipante.estabelecimento);
    const somenteFornecedor = this.auth.requireParticipante(tiposParticipante.fornecedor);

    // ESTABELECIMENTO
    router.get(
      '/estabelecimento/indicacoes',
      this.pesquisarIndicacoesEc,
    );
    router.get(
      '/estabelecimento/:id/indicacoes',
      requireEstabelecimento,
      somenteEstabelecimento,
      this.obterFornecedoresIndicados
    );
    router.post(
      '/estabelecimento/:id/indicacao/:indicacaoId/alterar',
      requireEstabelecimento,
      somenteEstabelecimento,
      this.updateFornecedorIndicado
    );
    router.post(
      '/estabelecimento/indicacoes/:id/reprovar',
      requireBackoffice,
      this.reprovarIndicacao,
    );
    router.get(
      '/estabelecimento/checa-documento-indicacao-fornecedor/:documento',
      this.auth.requireParticipante(typeEnum.estabelecimento),
      this.checkDocumentIndicationProvider
    );
    // FORNECEDOR
    router.post(
      '/fornecedores/indicacoes',
      requireEstabelecimento,
      somenteEstabelecimento,
      this.indicarFornecedor
    );
    router.get(
      '/fornecedor/estabelecimentos/reprovados',
      requireFornecedor,
      somenteFornecedor,
      this.obterFornecedorIndicacoesReprovadas
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

  pesquisarIndicacoesEc = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { query } = req;
      const nominations = await this.useCasesIndicacao.searchNominationsUseCase(query);
      res.send(nominations);
    } catch (error) {
      next(error);
    }
  }

  indicarFornecedor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const estabelecimentoComercialId = +req.user.participante;
      const { documento, nome, email, telefone, participanteFornecedor } = req.body;

      await this.useCasesIndicacao
        .indicateProviderUseCase(nome, email, telefone, documento, participanteFornecedor, estabelecimentoComercialId);

      return res.end();
    } catch (error) {
      return next(error);
    }
  }

  obterFornecedoresIndicados = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const establishment = +req.user.participante;

      const fornecedoresIndicados = await this.useCasesIndicacao.getProviderNomineesUseCase(establishment);
      res.send(fornecedoresIndicados);
    } catch (error) {
      next(error);
    }
  }

  updateFornecedorIndicado = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const idEc = +req.user.participante;
      const indication = req.body;

      await this.useCasesIndicacao.updateProviderNomineesUseCase(indication, idEc);
      res.end();
    } catch (error) {
      next(error);
    }
  }

  obterFornecedorIndicacoesReprovadas = async (req: Request, res: Response, next: NextFunction) => {
    const fornecedorId = +req.user.participante;
    const {
      nome,
      documento,
      dataCadastroInicio,
      dataCadastroFim,
    } = req.query;

    return this.useCasesIndicacao.getProviderNominationUseCase(
      fornecedorId,
      participanteIndicacaoStatus.reprovado,
      nome,
      documento,
      dataCadastroInicio,
      dataCadastroFim
    )
      .then(arr => res.send(arr))
      .catch(next);
  }

  reprovarIndicacao = async (req: Request, res: Response, next: NextFunction) => {
    const { obervacao } = req.body;
    const id = +req.params.id;
    const { email } = req.user;
    const motivoId = +req.body.motivoId;
    return this.reprovarIndicacaoService(id, motivoId, obervacao, email)
      .then(() => res.end())
      .catch(next);
  }
  checkDocumentIndicationProvider = async (req: Request, res: Response, next: NextFunction) => {
    const { documento } = req.params;
    const estabelecimentoId = +req.user.participante;

    return this.useCasesIndicacao.checkProviderIndicationUseCase(estabelecimentoId, documento)
      .then(obj => res.send(obj))
      .catch(next);
  }

  rejectNomination = async (req: Request, res: Response, next: NextFunction) => this.useCasesIndicacao
    .rejectNomination(req.body.documento, req.body.motivoTipoRecusaId, req.body.motivo, req.user.email)
    .then(() => res.end())
    .catch(next)

  listIdentifiers = async (req: Request, res: Response, next: NextFunction) => this.useCasesIndicacao
    .searchIdentifiers(
      req.params.cnpjFornecedor, req.params.cnpjEstabelecimento
    )
    .then(data => res.send(data))
    .catch(next)

  getIdentifier = async (req: Request, res: Response, next: NextFunction) => this.useCasesIndicacao
    .identifier(req.params.cnpjFornecedor)
    .then(data => res.send(data))
    .catch(next)

  checkDocumentIndicationEstablishment = async (req: Request, res: Response, next: NextFunction) => {
    const { documento } = req.params;
    const fornecedorId = +req.user.participante;

    return this.useCasesIndicacao.checkECIndicationUseCase(fornecedorId, documento)
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

      await this.useCasesIndicacao.newIndicationUseCase(
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

    return this.useCasesIndicacao.getIndicationEstablishmentUseCase(indicacaoId, participanteId)
      .then(indicacao => res.send(indicacao))
      .catch(next);
  }

  updateIndicationEstablishment = async (req: Request, res: Response, next: NextFunction) => {
    const participanteId = +req.user.participante;
    const usuario = req.user.email;

    return this.useCasesIndicacao.updateIndicationEstablishmentUseCase(
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

export default ParticipantesController;
