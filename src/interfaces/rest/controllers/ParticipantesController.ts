// tslint:disable:no-magic-numbers
import { Router, Response, NextFunction } from 'express';
import { Request } from 'express-request';
import { injectable, inject } from 'inversify';
import { Sequelize } from 'sequelize-database';
import { DateTime } from 'luxon';

import Controller from '../Controller';
import { LoggerInterface } from '../../../infra/logging';
import { typeEnum as tiposParticipante } from '../../../domain/services/participante/typeEnum';
import rateTypeEnum from '../../../domain/services/participante/rateTypeEnum';
import fetchFile from '../../../domain/services/participante/fetchFile';
import Auth from '../../../infra/auth/Auth';
import FileStorage from '../../../infra/fileStorage/FileStorage';
import { Mailer } from '../../../infra/mailer';
import { SiscofWrapper } from '../../../infra/siscof';
import { rolesEnum as roles } from '../../../domain/services/auth/rolesEnum';
import participanteVinculoStatus from '../../../domain/entities/participanteVinculoStatus';
import VinculoService from '../../../domain/services/VinculoService';
import searchEcNominationUseCase from '../../../domain/usecases/participante/searchEcNominationUseCase';
import personTypeEnum from '../../../domain/services/participante/personTypeEnum';
import participateNominationSourceEnum from '../../../domain/entities/participateNominationSourceEnum';
import rejectNominationService from '../../../domain/services/participante/rejectNominationService';
import participante from '../../../domain/usecases/participante';
import formatDocumento from '../../../domain/services/participante/formatDocumento';
import getProviderLinksUseCase from '../../../domain/usecases/vinculo/getProviderLinksUseCase';
import getProviderNominationUseCase from '../../../domain/usecases/vinculo/getProviderNominationUseCase';
import getProviderRequestedLinksUsecase from '../../../domain/usecases/vinculo/getProviderRequestedLinksUsecase';
import linkStatusEnum from '../../../domain/services/vinculo/linkStatusEnum';
import types from '../../../constants/types';
import { config } from '../../../config';
import { IncludeOptions } from 'sequelize';
import participanteIndicacaoStatus from '../../../domain/entities/participanteIndicacaoStatus';
import { FornecedorLinked, EstabelecimentoLinked, VinculoNotFound } from '../exceptions/ApiExceptions';

@injectable()
class ParticipantesController implements Controller {
  db: Sequelize;
  logger: LoggerInterface;
  auth: Auth;
  fileStorage: FileStorage;
  siscofWrapper: SiscofWrapper;
  mailer: Mailer;
  mailerSettings: any;
  fetchFile: (type: any, index: any, document: any, id: any) => Promise<any>;
  emailTemplates: any;
  vinculoService: VinculoService;
  indicacoesEc: (options: any) => Promise<any>;
  useCasesParticipante: any;
  reprovarIndicacaoService: (participanteId: any, motivoTipoRecusaId: any, motivo: any, usuario: any) => any;

  constructor(
    @inject(types.Database) db: Sequelize,
    @inject(types.Logger) logger: LoggerInterface,
    @inject(types.AuthFactory) auth: () => Auth,
    @inject(types.FileStorageFactory) fileStorage: () => FileStorage,
    @inject(types.SiscofWrapper) siscofWrapper: SiscofWrapper,
    @inject(types.MailerFactory) mailer: () => Mailer,
    @inject(types.VinculoService) vinculoService: VinculoService,
  ) {
    this.db = db;
    this.logger = logger;
    this.auth = auth();
    this.fileStorage = fileStorage();
    this.siscofWrapper = siscofWrapper;
    this.mailer = mailer();
    this.emailTemplates = this.mailer.emailTemplates;
    this.mailerSettings = config.mailer;
    this.vinculoService = vinculoService;

    this.fetchFile = fetchFile(this.db, this.fileStorage);
    this.indicacoesEc = searchEcNominationUseCase(this.db);
    this.useCasesParticipante = participante(this.db, this.fileStorage);
    this.reprovarIndicacaoService = rejectNominationService(this.db);
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
    const somenteEstabelecimento = this.auth.requireParticipante(
      tiposParticipante.estabelecimento
    );
    const somenteFornecedor = this.auth.requireParticipante(
      tiposParticipante.fornecedor
    );

    router.get(
      '/participantes',
      this.auth.require(
        roles.boAdministrador,
        roles.boOperacoes
      ),
      this.pesquisarParticipantes
    );

    router.get(
      '/estabelecimento/indicacoes',
      this.auth.require(
        roles.boAdministrador,
        roles.boOperacoes
      ),
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
      this.auth.require(
        roles.boAdministrador,
        roles.boOperacoes
      ),
      this.reprovarIndicacao,
    );

    // Consultas para o participante
    router.get(
      '/participante/detalhe/cadastro',
      this.auth.requireParticipante(
        tiposParticipante.estabelecimento,
        tiposParticipante.fornecedor
      ),
      this.obterDetalheCadastro
    );

    router.get(
      '/participante/detalhe/contato',
      this.auth.requireParticipante(
        tiposParticipante.estabelecimento,
        tiposParticipante.fornecedor
      ),
      this.obterDetalheContato
    );

    router.get(
      '/participante/detalhe/domiciliosbancarios',
      this.auth.requireParticipante(
        tiposParticipante.estabelecimento,
        tiposParticipante.fornecedor
      ),
      this.obterDetalheDomiciliosBancarios
    );

    router.get(
      '/participante/detalhe/condicoescomerciais',
      this.auth.requireParticipante(
        tiposParticipante.estabelecimento,
        tiposParticipante.fornecedor
      ),
      this.obterDetalheCondicoesComerciais
    );

    router.get(
      '/participante/extrato/:reportId',
      this.auth.requireParticipante(
        tiposParticipante.estabelecimento,
        tiposParticipante.fornecedor
      ),
      this.obterExtrato
    );

    router.get(
      '/participante/:id/extrato/:reportId',
      requireBackoffice,
      this.obterExtratoBackoffice
    );

    router.get('/fornecedor/:documento', this.procurarFornecedor);
    router.get('/fornecedores', this.obterFornecedores);

    router.get(
      '/fornecedor/:id/estabelecimentos',
      requireFornecedor,
      somenteFornecedor,
      this.obterFornecedorVinculos
    );
    router.get(
      '/vinculo/:id',
      requireFornecedor,
      somenteFornecedor,
      this.obterVinculo
    );
    router.post(
      '/fornecedores/indicacoes',
      requireEstabelecimento,
      somenteEstabelecimento,
      this.indicarFornecedor
    );
    router.post(
      '/fornecedor/:id/estabelecimento/:establecimentoId/vinculo/alterar',
      requireFornecedor,
      somenteFornecedor,
      this.alterarVinculoComEC
    );
    router.post(
      '/fornecedor/:id/estabelecimento',
      requireFornecedor,
      somenteFornecedor,
      this.vincularEstabelecimento
    );

    router.get(
      '/estabelecimentos',
      this.obterEstabelecimentos
    );
    router.get(
      '/estabelecimento/:documento',
      this.procurarEstabelecimento
    );

    router.get(
      '/estabelecimento/:id/fornecedores',
      requireEstabelecimento,
      somenteEstabelecimento,
      this.obterEstabelecimentoVinculos
    );
    router.post(
      '/estabelecimento/:id/fornecedor',
      requireEstabelecimento,
      somenteEstabelecimento,
      this.vincularFornecedor
    );
    router.post(
      '/estabelecimento/:id/fornecedor/:fornecedorId/vinculo/alterar',
      requireEstabelecimento,
      somenteEstabelecimento,
      this.alterarVinculoComFornecedor
    );
    router.post(
      '/estabelecimento/:id/fornecedor/:fornecedorId/aprovar',
      requireEstabelecimento,
      somenteEstabelecimento,
      this.aprovarVinculoFornecedor
    );
    router.post(
      '/estabelecimento/:id/fornecedor/:fornecedorId/recusar',
      requireEstabelecimento,
      somenteEstabelecimento,
      this.recusarVinculoFornecedor
    );
    router.post(
      '/estabelecimento/:id/fornecedor/:fornecedorId/cancelar',
      requireEstabelecimento,
      somenteEstabelecimento,
      this.cancelarVinculoFornecedor
    );
    router.post(
      '/estabelecimento/:id/fornecedor/:fornecedorId/reativar',
      requireEstabelecimento,
      somenteEstabelecimento,
      this.reativarVinculoFornecedor
    );

    router.get(
      '/fornecedor/estabelecimentos/pendentes',
      requireFornecedor,
      somenteFornecedor,
      this.obterFornecedorVinculosPendentes
    );

    router.get(
      '/fornecedor/estabelecimentos/reprovados',
      requireFornecedor,
      somenteFornecedor,
      this.obterFornecedorIndicacoesReprovadas
    );

    // APIs para compatibilidade com o Gateway
    // TODO: Rever forma de consumir essas APIs
    router.get(
      '/fornecedor/:fornecedorId/estabelecimento/:estabelecimentoId/vinculo',
      requireFornecedor,
      somenteFornecedor,
      this.obterValorVinculo
    );

    return router;
  }

  pesquisarIndicacoesEc = async (req: Request, res: Response, next: NextFunction) => {
    const { query } = req;
    return this.indicacoesEc(query)
      .then(data => res.send(data))
      .catch(next);
  }

  pesquisarParticipantes = async (req: Request, res: Response, next: NextFunction) => {
    let where = {};

    if (req.query.term) {
      where = this.db.where(
        this.db.fn('unaccent', this.db.col('nome')),
        { $iLike: this.db.fn('unaccent', `%${req.query.term}%`) }
      );
    }

    return this.db.entities.participante
      .findAll({
        where,
        attributes: ['id', 'nome'],
        order: [['nome', 'ASC']],
      })
      .then(participantes => participantes.map(c => ({
        id: c.id,
        text: `${c.nome}`,
      })))
      .then(participantes => res.send(participantes))
      .catch(next);
  }

  obterParticipante = (identityName) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      return this.db.entities[identityName]
        .findAll({
          attributes: ['participanteId'],
          include: [{
            model: this.db.entities.participante,
            attributes: ['id', 'documento', 'nome'],
          }],
        })
        .then(found => res.send(
          found.map(t => ({ ...t.participante.dataValues }))
        ))
        .catch(next);
    };
  }

  obterFornecedores = this.obterParticipante('participanteFornecedor');
  obterEstabelecimentos = this.obterParticipante('participanteEstabelecimento');

  procurarParticipante = (identityName) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      const participanteId = +req.user.participante;
      const { documento } = req.params;

      try {
        const found = await this.db.entities[identityName].findOne({
          attributes: ['participanteId'],
          include: [{
            model: this.db.entities.participante,
            attributes: ['id', 'documento', 'nome'],
            where: {
              documento,
              ativo: true,
            },
          }],
        });

        if (found) {
          return res.send(found.participante);
        }

        const indicacoes = this.db.entities.indicacaoFornecedorFalha;
        const indicacao = {
          participanteId,
          documento,
          usuario: req.user.email,
        };

        const jaIndicado = await indicacoes.findOne({ where: indicacao });

        if (jaIndicado) {
          return res.send({});
        }

        await indicacoes.create(indicacao);
        return res.send({});
      } catch (error) {
        return next(error);
      }
    };
  }

  procurarFornecedor = this.procurarParticipante(
    'participanteFornecedor'
  );

  procurarEstabelecimento = this.procurarParticipante(
    'participanteEstabelecimento'
  );

  indicarFornecedor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const estabelecimentoComercialId = +req.user.participante;
      const { documento, nome, email, telefone } = req.body;

      const tipoPessoa = personTypeEnum.verifyPersonType(documento);
      const canalEntrada = req.user.participanteFornecedor
        ? participateNominationSourceEnum.indicacaoPorFornecedor
        : participateNominationSourceEnum.indicacaoPorEc;
      const statusPendente = participanteVinculoStatus.pendente;

      const participantes = await this.db.entities.participante.findAll({
        where: {
          id: estabelecimentoComercialId,
          ativo: true,
        },
        attributes: ['id', 'nome', 'razaoSocial'],
        include: [{
          model: this.db.entities.participanteIndicacao,
          as: 'indicacoes',
          attributes: ['id', 'documento'],
        }],
      });

      const estabelecimentoComercial = participantes.find(
        i => i.id === estabelecimentoComercialId
      );

      if (!estabelecimentoComercial) {
        throw Error('estabelecimento-nao-encontrado');
      }

      if (estabelecimentoComercial.indicacoes.some(i => i.documento === documento)) {
        throw Error('fornecedor-ja-indicado');
      }

      await this.db.entities.participanteIndicacao.create({
        documento,
        nome,
        email,
        telefone,
        tipoPessoa,
        canalEntrada,
        statusPendente,
        participanteId: estabelecimentoComercialId,
        usuario: req.user.email
      });

      try {
        await this.mailer.enviar({
          templateName: this.emailTemplates.INDICACAO_FORNECEDOR_NAO_CADASTRADO,
          destinatary: req.user.email,
          substitutions: {
            estabelecimento: estabelecimentoComercial.razaoSocial
              || estabelecimentoComercial.nome,
            fornecedor: formatDocumento(documento),
            linkCessao: `${this.mailerSettings.baseUrl}/cessoes`,
          },
        });
      } catch (e) {
        this.logger.error(e);
      }

      return res.end();
    } catch (error) {
      return next(error);
    }
  }

  vincular = (solicitadoEstabelecimento) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      const estabelecimentoComercialId = solicitadoEstabelecimento
        ? +req.user.participante
        : +req.body.estabelecimentoComercialId;
      const fornecedorId = !solicitadoEstabelecimento
        ? +req.user.participante
        : +req.body.fornecedorId;

      if (estabelecimentoComercialId === fornecedorId) {
        throw new Error('vinculo-mesmo-participante-invalido');
      }

      const contatoInclude = () => ({
        model: this.db.entities.participanteContato,
        as: 'contatos',
        attributes: ['participanteId', 'email'],
        where: { ativo: true },
      });

      const participanteInclude = () => ({
        model: this.db.entities.participante,
        as: 'participante',
        attributes: ['id', 'nome'],
        include: [contatoInclude()],
        where: { ativo: true },
      });

      const vinculoInclude = () => ({
        model: this.db.entities.participanteVinculo,
        as: 'vinculos',
        attributes: [
          'id',
          'participanteEstabelecimentoId',
          'participanteFornecedorId',
        ],
      });

      const createParticipanteVinculo = (
        participanteEstabelecimentoId,
        participanteFornecedorId,
        estabelecimentoSolicitouVinculo,
        statusVinculo
      ) => this.db.entities.participanteVinculo.create({
        participanteEstabelecimentoId,
        participanteFornecedorId,
        estabelecimentoSolicitouVinculo,
        usuario: req.user.email,
        exibeValorDisponivel: true,
        diasAprovacao: 2,
        status: statusVinculo,
        dataRespostaEstabelecimento: DateTime.local(),
        usuarioRespostaEstabelecimento: req.user.email,
      });

      return Promise.all([
        this.db.entities.participanteFornecedor.findOne({
          where: { participanteId: fornecedorId },
          attributes: ['participanteId'],
          include: [participanteInclude(), vinculoInclude()],
        }),
        this.db.entities.participanteEstabelecimento.findOne({
          where: { participanteId: estabelecimentoComercialId },
          attributes: ['participanteId'],
          include: [participanteInclude(), vinculoInclude()],
        })])
        .then((results) => {
          const fornecedor = results[0];
          const estabelecimento = results[1];

          if (!estabelecimento) {
            throw new Error('estabelecimento-nao-encontrado');
          }

          if (!fornecedor) {
            throw new Error('fornecedor-nao-encontrado');
          }

          if (solicitadoEstabelecimento && estabelecimento.vinculos.some(
            f => f.participanteFornecedorId === fornecedorId
          )) {
            throw new FornecedorLinked();
          }

          if (!solicitadoEstabelecimento && fornecedor.vinculos.some(
            f => f.participanteEstabelecimentoId === estabelecimentoComercialId
          )) {
            throw new EstabelecimentoLinked();
          }

          if (solicitadoEstabelecimento) {
            return this.siscofWrapper.incluirExcluirCessionarioEC(
              fornecedorId,
              estabelecimentoComercialId,
              participanteVinculoStatus.aprovado
            )
              .then(() => {
                createParticipanteVinculo(
                  estabelecimentoComercialId,
                  fornecedorId,
                  solicitadoEstabelecimento,
                  participanteVinculoStatus.aprovado
                )
                  .then(() => Promise.all([
                    this.mailer.enviar({
                      templateName: this.emailTemplates.INDICACAO_FORNECEDOR_CADASTRADO,
                      destinatary: fornecedor.participante.contatos[0].email,
                      substitutions: {
                        estabelecimento: estabelecimento.participante.nome,
                        linkSolicitarCessao: `${this.mailerSettings.baseUrl}/fornecedor/estabelecimentos`,
                      },
                    }),
                    this.mailer.enviar({
                      templateName: this.emailTemplates.INDICACAO_FORNECEDOR_CADASTRADO_ESTABELECIMENTO,
                      destinatary: req.user.email,
                      substitutions: {
                        fornecedor: fornecedor.participante.nome,
                        linkSolicitarCessaoPendentes: `${this.mailerSettings.baseUrl}/estabelecimento/fornecedores`,
                      },
                    }),
                  ]));
              });
          }

          return createParticipanteVinculo(
            estabelecimentoComercialId,
            fornecedorId,
            solicitadoEstabelecimento,
            participanteVinculoStatus.pendente
          )
            .then(() => Promise.all([
              this.mailer.enviar({
                templateName: this.emailTemplates.INDICACAO_ESTABELECIMENTO_CADASTRADO,
                destinatary: estabelecimento.participante.contatos[0].email,
                substitutions: {
                  fornecedor: fornecedor.participante.nome,
                  linkFornecedoresCessao: `${this.mailerSettings.baseUrl}/estabelecimento/fornecedores`,
                },
              }),
              this.mailer.enviar({
                templateName: this.emailTemplates.INDICACAO_ESTABELECIMENTO_FORNECEDOR,
                destinatary: req.user.email,
                substitutions: {
                  estabelecimento: estabelecimento.participante.nome,
                  linkSolicitarCessao: `${this.mailerSettings.baseUrl}/fornecedor/estabelecimentos`,
                },
              }),
            ]));
        })
        .then(() => res.end())
        .catch(next);
    };
  }

  vincularFornecedor = this.vincular(true);
  vincularEstabelecimento = this.vincular(false);

  obterVinculos = (identityName, solicitadoEstabelecimento) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      const id = +req.user.participante;
      const statusVinculo = +req.query.status;

      const include = [];

      if (solicitadoEstabelecimento) {
        include.push({
          model: this.db.entities.participanteFornecedor,
          as: 'fornecedor',
          attributes: ['participanteId'],
          include: [{
            model: this.db.entities.participante,
            as: 'participante',
            attributes: ['id', 'nome', 'documento'],
          }],
        });
      } else {
        include.push({
          model: this.db.entities.participanteEstabelecimento,
          as: 'estabelecimento',
          attributes: ['participanteId'],
          include: [{
            model: this.db.entities.participante,
            as: 'participante',
            attributes: ['id', 'nome', 'documento'],
          }],
        });
      }

      if (statusVinculo === participanteVinculoStatus.reprovado) {
        include.push({
          as: 'recusa',
          model: this.db.entities.motivoTipoRecusa,
          include: [{
            model: this.db.entities.motivoRecusa,
            as: 'motivoRecusa',
            attributes: ['id', 'descricao', 'requerObservacao'],
            where: { ativo: true },
            required: false,
          }],
          required: false,
        });
      }

      return this.db.entities[identityName].findOne({
        where: { participanteId: id },
        include: [{
          include,
          model: this.db.entities.participanteVinculo,
          as: 'vinculos',
          attributes: [
            'id',
            'usuario',
            'status',
            'exibeValorDisponivel',
            'diasAprovacao',
            'createdAt',
            'valorMaximoExibicao',
            'dataRespostaEstabelecimento'
          ],
          where: { status: statusVinculo }
        }],
      })
        .then((participanteData) => {
          if (!participanteData) {
            res.send([]);
            return;
          }

          res.send(participanteData.vinculos.map(t => ({
            id: t.id,
            participante: (t.fornecedor || t.estabelecimento)
              .dataValues.participante.dataValues,
            status: t.status,
            exibeValorDisponivel: t.exibeValorDisponivel,
            valorMaximoExibicao: t.valorMaximoExibicao,
            diasAprovacao: t.diasAprovacao,
            dataCadastro: t.createdAt,
            motivoRecusa: (t.recusa && t.recusa.motivoRecusa) ? t.recusa.motivoRecusa.descricao : '',
            dataRecusa: t.dataRespostaEstabelecimento
          })));
        })
        .catch(next);
    };
  }

  obterEstabelecimentoVinculos = this.obterVinculos(
    'participanteEstabelecimento', true
  );

  obterFornecedoresIndicados = async (req: Request, res: Response, next: NextFunction) => {
    const establishment = +req.user.participante;

    return this.useCasesParticipante.getProviderNominees(establishment)
      .then(arr => res.send(arr))
      .catch(next);
  }

  updateFornecedorIndicado = async (req: Request, res: Response, next: NextFunction) => {
    const idEc = +req.user.participante;
    const indication = req.body;

    return this.useCasesParticipante.updateProviderNominees(indication, idEc)
      .then(() => res.end())
      .catch(next);
  }

  obterFornecedorVinculos = async (req: Request, res: Response, next: NextFunction) => {
    const fornecedorId = +req.user.participante;
    const {
      status,
      nome,
      documento,
      dataCadastroInicio,
      dataCadastroFim,
    } = req.query;

    return getProviderLinksUseCase(this.db, this.siscofWrapper)(
      fornecedorId,
      status,
      nome,
      documento,
      dataCadastroInicio,
      dataCadastroFim
    )
      .then(arr => res.send(arr))
      .catch(next);
  }

  obterFornecedorVinculosPendentes = async (req: Request, res: Response, next: NextFunction) => {
    const fornecedorId = +req.user.participante;
    const {
      nome,
      documento,
      dataCadastroInicio,
      dataCadastroFim,
    } = req.query;

    return Promise.all([
      getProviderNominationUseCase(this.db)(
        fornecedorId,
        participanteIndicacaoStatus.pendente,
        nome,
        documento,
        dataCadastroInicio,
        dataCadastroFim
      ),
      getProviderRequestedLinksUsecase(this.db)(
        fornecedorId,
        linkStatusEnum.pendente,
        nome,
        documento,
        dataCadastroInicio,
        dataCadastroFim,
      ),
    ])
      .then(results => res.send(results[0].concat(results[1])))
      .catch(next);
  }

  obterFornecedorIndicacoesReprovadas = async (req: Request, res: Response, next: NextFunction) => {
    const fornecedorId = +req.user.participante;
    const {
      nome,
      documento,
      dataCadastroInicio,
      dataCadastroFim,
    } = req.query;

    return getProviderNominationUseCase(this.db)(
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

  notificarIndicacao = (vinculo) => {
    const contatoInclude = () => ({
      model: this.db.entities.participanteContato,
      as: 'contatos',
      attributes: ['participanteId', 'email'],
      where: { ativo: true },
    });

    const participanteInclude = () => ({
      model: this.db.entities.participante,
      as: 'participante',
      attributes: ['id', 'nome'],
      include: [contatoInclude()],
      where: { ativo: true },
    });

    return Promise.all([
      this.db.entities.participanteFornecedor.findOne({
        where: { participanteId: vinculo.participanteFornecedorId },
        attributes: ['participanteId'],
        include: [participanteInclude()],
      }),
      this.db.entities.participanteEstabelecimento.findOne({
        where: { participanteId: vinculo.participanteEstabelecimentoId },
        attributes: ['participanteId'],
        include: [participanteInclude()],
      }),
    ]).then((results) => {
      const fornecedor = results[0];
      const estabelecimento = results[1];

      if (vinculo.status === participanteVinculoStatus.aprovado) {
        return this.mailer.enviar({
          templateName: this.emailTemplates.INDICACAO_ESTABELECIMENTO_ACEITA,
          destinatary: fornecedor.participante.contatos[0].email,
          substitutions: {
            estabelecimento: estabelecimento.participante.nome,
            linkSolicitarCessao:
              `${this.mailerSettings.baseUrl}/fornecedor/estabelecimentos`,
          },
        });
      }

      if (vinculo.status === participanteVinculoStatus.reprovado) {
        return this.mailer.enviar({
          templateName: this.emailTemplates.INDICACAO_ESTABELECIMENTO_RECUSADA,
          destinatary: fornecedor.participante.contatos[0].email,
          substitutions: {
            estabelecimento: estabelecimento.participante.nome,
          },
        });
      }

      return null;
    });
  }

  alterarStatus = (novoStatus) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      const id = +req.body.id;
      const estabelecimentoId = +req.user.participante;

      return this.db.entities.participanteVinculo.findOne({
        where:
        {
          id,
          participanteEstabelecimentoId: estabelecimentoId,
        },
      })
        .then((vinculo) => {
          if (!vinculo) {
            throw new VinculoNotFound();
          }

          return this.siscofWrapper.incluirExcluirCessionarioEC(
            vinculo.participanteFornecedorId,
            vinculo.participanteEstabelecimentoId,
            novoStatus
          )
            .then(() => {
              vinculo.status = novoStatus;

              if (novoStatus === participanteVinculoStatus.aprovado
                || novoStatus === participanteVinculoStatus.reprovado) {
                vinculo.dataRespostaEstabelecimento = DateTime.local();
                vinculo.usuarioRespostaEstabelecimento = req.user.email;
              }

              if (novoStatus === participanteVinculoStatus.cancelado
                || novoStatus === participanteVinculoStatus.reprovado) {
                vinculo.motivoTipoRecusaId = +req.body.motivoTipoRecusaId;
                vinculo.motivoRecusaObservacao = req.body.observacao;
              }

              return Promise.all([
                vinculo.save(),
                this.db.entities.participanteVinculoHistorico.create({
                  participanteEstabelecimentoId: vinculo.participanteEstabelecimentoId,
                  participanteFornecedorId: vinculo.participanteFornecedorId,
                  status: vinculo.status,
                  exibeValorDisponivel: vinculo.exibeValorDisponivel,
                  diasAprovacao: vinculo.diasAprovacao,
                  dataRespostaEstabelecimento: new Date(),
                  usuarioRespostaEstabelecimento: req.user.email,
                }),
                this.notificarIndicacao(vinculo),
              ]);
            });
        })
        .then(() => res.end())
        .catch(next);
    };
  }

  aprovarVinculoFornecedor = this.alterarStatus(participanteVinculoStatus.aprovado);
  recusarVinculoFornecedor = this.alterarStatus(participanteVinculoStatus.reprovado);
  cancelarVinculoFornecedor = this.alterarStatus(participanteVinculoStatus.cancelado);
  reativarVinculoFornecedor = this.alterarStatus(participanteVinculoStatus.aprovado);

  notificarFornecedorSobreValorDisponivel = (
    solicitadoEstabelecimento,
    vinculo
  ) => {
    if (solicitadoEstabelecimento === false) return Promise.resolve();

    const contatoInclude = () => ({
      model: this.db.entities.participanteContato,
      as: 'contatos',
      attributes: ['participanteId', 'email'],
      where: { ativo: true },
    });

    const participanteInclude = () => ({
      model: this.db.entities.participante,
      as: 'participante',
      attributes: ['id', 'nome'],
      include: [contatoInclude()],
      where: { ativo: true },
    });

    return Promise.all([
      this.db.entities.participanteFornecedor.findOne({
        where: { participanteId: vinculo.participanteFornecedorId },
        attributes: ['participanteId'],
        include: [participanteInclude()],
      }),
      this.db.entities.participanteEstabelecimento.findOne({
        where: { participanteId: vinculo.participanteEstabelecimentoId },
        attributes: ['participanteId'],
        include: [participanteInclude()],
      }),
    ]).then((results) => {
      const fornecedor = results[0];
      const estabelecimento = results[1];

      if (!estabelecimento.participante.contato) {
        return null;
      }

      if (vinculo.exibeValorDisponivel) {
        return this.mailer.enviar({
          templateName: this.emailTemplates.LIBERACAO_VALOR_DISPONIVEL_FORNECEDOR,
          destinatary: estabelecimento.participante.contatos[0].email,
          substitutions: {
            fornecedor: fornecedor.participante.nome,
            linkAlteracaoValorDisponivel:
              `${this.mailerSettings.baseUrl}/estabelecimento/fornecedores`,
          },
        });
      }

      return this.mailer.enviar({
        templateName: this.emailTemplates.CANCELAMENTO_VALOR_DISPONIVEL_FORNECEDOR,
        destinatary: estabelecimento.participante.contatos[0].email,
        substitutions: {
          fornecedor: fornecedor.participante.nome,
          linkAlteracaoValorDisponivel:
            `${this.mailerSettings.baseUrl}/estabelecimento/fornecedores`,
        },
      });
    })
      .catch(e => this.logger.error(e));
  }

  alterarVinculo = (solicitadoEstabelecimento) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      const id = +req.body.vinculoId;
      const participanteId = +req.user.participante;
      const where: any = { id };

      if (!id) {
        throw new Error(`invalid-vinculo-id${req.body.vinculoId}`);
      }

      if (!participanteId) {
        throw new Error(`invalid-participante-id${req.user.participante}`);
      }

      if (solicitadoEstabelecimento) {
        where.participanteEstabelecimentoId = participanteId;
      } else {
        where.participanteFornecedorId = participanteId;
      }

      return this.db.entities.participanteVinculo
        .findOne({ where })
        .then((vinculo) => {
          if (!vinculo) {
            throw new Error('vinculo-nao-encontrato');
          }

          if (solicitadoEstabelecimento) {
            vinculo.exibeValorDisponivel = req.body.exibeValorDisponivel;
            vinculo.valorMaximoExibicao = req.body.valorMaximoExibicao;
          } else {
            vinculo.diasAprovacao = +req.body.diasAprovacao;
          }

          return Promise.all([
            vinculo.save(),
            this.db.entities.participanteVinculoHistorico.create({
              participanteEstabelecimentoId: vinculo.participanteEstabelecimentoId,
              participanteFornecedorId: vinculo.participanteFornecedorId,
              status: vinculo.status,
              exibeValorDisponivel: vinculo.exibeValorDisponivel,
              valorMaximoExibicao: vinculo.valorMaximoExibicao,
              diasAprovacao: vinculo.diasAprovacao,
              usuario: req.user.email,
            }),
            this.notificarFornecedorSobreValorDisponivel(
              solicitadoEstabelecimento,
              vinculo
            ),
          ]);
        })
        .then(() => res.end())
        .catch(next);
    };
  }

  alterarVinculoComEC = this.alterarVinculo(false);
  alterarVinculoComFornecedor = this.alterarVinculo(true);

  obterVinculo = async (req: Request, res: Response, next: NextFunction) => {
    const vinculoId = +req.params.id;
    const include = [{
      model: this.db.entities.participanteEstabelecimento,
      as: 'estabelecimento',
      include: [{
        model: this.db.entities.participante,
        as: 'participante',
        attributes: ['id', 'documento', 'nome'],
      }],
    }];

    return this.vinculoService
      .obterVinculoPorId(vinculoId, include)
      .then(vinculo => res.send(vinculo))
      .catch(next);
  }

  obterValorVinculo = async (req: Request, res: Response, next: NextFunction) => {
    const fornecedorId = +req.user.participante;
    const estabelecimentoId = +req.params.estabelecimentoId;

    return this.vinculoService
      .obterVinculoPorIdParticipantes(estabelecimentoId, fornecedorId)
      .then(vinculo => res.send({ valor: vinculo.valor }))
      .catch(next);
  }

  // Métodos de consulta para o participante
  detalheCadastro = (participanteId) => {
    return this.db.entities.participante.findOne({
      where: {
        id: participanteId,
      },
      attributes: [
        'id',
        'tipoPessoa',
        'documento',
        'nome',
        'razaoSocial',
        'inscricaoEstadual',
        'inscricaoMunicipal',
        'cep',
        'logradouro',
        'numero',
        'complemento',
        'bairro',
      ],
      include: [
        {
          model: this.db.entities.cidade,
          as: 'cidade',
          attributes: ['nome', 'estado'],
        },
      ],
    });
  }

  detalheContato = (participanteId) => {
    return this.db.entities.participante.findOne({
      where: {
        id: participanteId,
      },
      attributes: [
        'id',
        'tipoPessoa',
        'documento',
      ],
      include: [
        {
          model: this.db.entities.participanteContato,
          as: 'contatos',
          attributes: ['nome', 'email', 'telefone', 'celular'],
          where: {
            ativo: true,
          },
        },
      ],
    })
      .then((participanteData) => {
        const contato = (
          (participanteData.contatos || []).length > 0
            ? participanteData.contatos[0]
            : null
        );

        return {
          contato,
          id: participanteData.id,
          tipoPessoa: participanteData.tipoPessoa,
          documento: participanteData.documento,
        };
      });
  }

  detalheDomiciliosBancarios = (participanteId) => {
    const bandeiraInclude = (): IncludeOptions => ({
      model: this.db.entities.bandeira,
      as: 'bandeira',
      attributes: ['id', ['nome', 'text']],
    });

    return this.db.entities.participante.findOne({
      where: {
        id: participanteId,
      },
      attributes: [
        'id',
        'tipoPessoa',
        'documento',
      ],
      include: [
        {
          model: this.db.entities.participanteDomicilioBancario,
          as: 'domiciliosBancarios',
          attributes: [
            'id',
            'bancoId',
            'bancoNome',
            'agencia',
            'conta',
            'digito',
            'arquivo'
          ],
          include: [bandeiraInclude()],
        },
      ],
    })
      .then(participanteData => ({
        id: participanteData.id,
        tipoPessoa: participanteData.tipoPessoa,
        documento: participanteData.documento,
        domiciliosBancarios: participanteData.domiciliosBancarios,
      }));
  }

  detalheCondicoesComerciais = (participanteId) => {
    const bandeiraInclude = (): IncludeOptions => ({
      model: this.db.entities.bandeira,
      as: 'bandeira',
      attributes: ['id', ['nome', 'text']],
    });

    return this.db.entities.credenciamento.findOne({
      where: {
        participanteId,
        ativo: true,
      },
      attributes: ['id', 'taxaContratualId', 'taxaAdesao'],
      include: [
        {
          model: this.db.entities.participante,
          as: 'participante',
          attributes: [
            'id',
            'tipoPessoa',
            'documento',
          ],
          required: true,
          include: [
            {
              model: this.db.entities.participanteTaxa,
              as: 'taxas',
              attributes: ['taxa'],
              where: {
                participanteTaxaTipo: rateTypeEnum.antecipacao,
              },
            },
          ],
        },
        {
          model: this.db.entities.credenciamentoCaptura,
          as: 'capturas',
          attributes: ['id', 'quantidade', 'valor'],
          include: [{
            model: this.db.entities.captura,
            as: 'captura',
            attributes: ['id', 'tipoCaptura'],
            include: [{
              model: this.db.entities.produto,
              as: 'produto',
              attributes: ['id', 'nome'],
            }],
          }],
        },
        {
          model: this.db.entities.taxaContratual,
          as: 'taxaContratual',
          attributes: ['id', 'antecipacao', 'adesao', 'maximoParcelas'],
        },
        {
          model: this.db.entities.credenciamentoTaxaAdministrativa,
          as: 'taxasAdministrativas',
          attributes: ['id', 'valor'],
          include: [{
            model: this.db.entities.taxaAdministrativa,
            as: 'taxaAdministrativa',
            attributes: ['id'],
            include: [
              bandeiraInclude(),
              {
                model: this.db.entities.taxaPrazo,
                as: 'taxaPrazo',
                attributes: [
                  'id', 'coeficiente', 'prazo', 'minimo', 'maximo',
                ],
              },
            ],
          }],
        },
        {
          model: this.db.entities.credenciamentoTaxaDebito,
          as: 'taxasDebito',
          attributes: ['id', 'valor'],
          include: [{
            model: this.db.entities.taxaBandeira,
            as: 'taxaBandeira',
            attributes: ['id'],
            include: [bandeiraInclude()],
          }],
        },
      ],
    })
      .then((credenciamento) => {
        const { participante: participanteData } = credenciamento;
        return {
          id: participanteData.id,
          tipoPessoa: participanteData.tipoPessoa,
          documento: participanteData.documento,
          credenciamento: credenciamento.id,
          captura: {
            url: credenciamento.ecommerce,
            capturas: credenciamento.capturas,
          },
          condicoesComerciais: {
            taxaContratual: {
              ...credenciamento.taxaContratual.dataValues,
              antecipacao: participanteData.taxas[0].taxa,
              adesao: credenciamento.taxaAdesao === null
                ? credenciamento.taxaContratual.adesao : credenciamento.taxaAdesao,
            },
            taxasDebito: credenciamento.taxasDebito.map(t => ({
              id: t.taxaBandeira.id,
              idTaxaCredenciamento: t.id,
              valor: t.valor,
              bandeira: t.taxaBandeira.bandeira,
            })),
            taxasAdministrativas: credenciamento.taxasAdministrativas.map(
              t => ({
                id: t.taxaAdministrativa.id,
                idTaxaCredenciamento: t.id,
                valor: t.valor,
                bandeira: t.taxaAdministrativa.bandeira,
                prazo: t.taxaAdministrativa.taxaPrazo.prazo,
                coeficiente: t.taxaAdministrativa.taxaPrazo.coeficiente,
                opcoesParcelamento: {
                  minimoParcelas: t.taxaAdministrativa.taxaPrazo.minimo,
                  maximoParcelas: t.taxaAdministrativa.taxaPrazo.maximo,
                },
              })
            ),
          },
        };
      });
  }

  downloadExtrato = (participanteId, reportId) => {
    return this.db.entities.participante
      .findOne({
        where: {
          id: participanteId,
        },
        attributes: ['documento'],
      })
      .then((participanteData) => {
        if (!participanteData) throw new Error('participante-nao-encontrado');

        return this.useCasesParticipante.fetchReportFile(reportId);
      });
  }

  sendBlobResponse = (data, res) => {
    res.set({
      'Content-Type': data.ContentType,
      'Content-Disposition': `attachment; filename=${data.filename}`,
    });

    res.write(data.Body);
    res.end();
  }

  obterDetalheCadastro = async (req: Request, res: Response, next: NextFunction) => {
    const participanteId = +req.user.participante;
    return this.detalheCadastro(participanteId)
      .then(data => res.send(data))
      .catch(next);
  }

  obterDetalheContato = async (req: Request, res: Response, next: NextFunction) => {
    const participanteId = +req.user.participante;
    return this.detalheContato(participanteId)
      .then(data => res.send(data))
      .catch(next);
  }

  obterDetalheDomiciliosBancarios = async (req: Request, res: Response, next: NextFunction) => {
    const participanteId = +req.user.participante;
    return this.detalheDomiciliosBancarios(participanteId)
      .then(data => res.send(data))
      .catch(next);
  }

  obterDetalheCondicoesComerciais = async (req: Request, res: Response, next: NextFunction) => {
    const participanteId = +req.user.participante;
    return this.detalheCondicoesComerciais(participanteId)
      .then(data => res.send(data))
      .catch(next);
  }

  obterExtrato = async (req: Request, res: Response, next: NextFunction) => {
    const participanteId = +req.user.participante;
    const reportId = +req.params.reportId;
    return this.downloadExtrato(participanteId, reportId)
      .then(data => this.sendBlobResponse(data, res))
      .catch((error: Error) => {
        throw new Error('download-extratosBancarios');
      })
      .catch(next);
  }

  obterExtratoBackoffice = async (req: Request, res: Response, next: NextFunction) => {
    const participanteId = +req.params.id;
    const reportId = +req.params.reportId;
    return this.downloadExtrato(participanteId, reportId)
      .then(data => this.sendBlobResponse(data, res))
      .catch((error: Error) => {
        throw new Error('download-extratosBancarios');
      })
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
}

export default ParticipantesController;
