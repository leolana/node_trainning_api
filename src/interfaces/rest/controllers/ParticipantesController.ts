// tslint:disable:no-magic-numbers
import { Router, Response, NextFunction } from 'express';
import { Request } from 'express-request';
import { injectable, inject } from 'inversify';
import { Sequelize } from 'sequelize-database';

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
import rejectNominationService from '../../../domain/services/participante/rejectNominationService';
import getProviderLinksUseCase from '../../../domain/usecases/vinculo/getProviderLinksUseCase';
import getProviderNominationUseCase from '../../../domain/usecases/vinculo/getProviderNominationUseCase';
import getProviderRequestedLinksUsecase from '../../../domain/usecases/vinculo/getProviderRequestedLinksUsecase';
import linkStatusEnum from '../../../domain/services/vinculo/linkStatusEnum';
import { IncludeOptions } from 'sequelize';
import participanteIndicacaoStatus from '../../../domain/entities/participanteIndicacaoStatus';
import { Environment, MailerEnv } from '../../../infra/environment/Environment';
import { ParticipantesUseCases, getParticipantesUseCases } from '../../../domain/usecases/participante';

import types from '../../../constants/types';

@injectable()
class ParticipantesController implements Controller {
  auth: Auth;
  fileStorage: FileStorage;
  mailer: Mailer;
  mailerSettings: MailerEnv;
  fetchFile: (type: any, index: any, document: any, id: any) => Promise<any>;
  emailTemplates: any;
  indicacoesEc: (options: any) => Promise<any>;
  useCasesParticipante: ParticipantesUseCases;
  reprovarIndicacaoService: (participanteId: any, motivoTipoRecusaId: any, motivo: any, usuario: any) => any;

  constructor(
    @inject(types.Database) private db: Sequelize,
    @inject(types.Logger) private logger: LoggerInterface,
    @inject(types.AuthFactory) auth: () => Auth,
    @inject(types.FileStorageFactory) fileStorage: () => FileStorage,
    @inject(types.SiscofWrapper) private siscofWrapper: SiscofWrapper,
    @inject(types.MailerFactory) mailer: () => Mailer,
    @inject(types.VinculoService) private vinculoService: VinculoService,
    @inject(types.Environment) private config: Environment,
  ) {
    this.auth = auth();
    this.fileStorage = fileStorage();
    this.mailer = mailer();
    this.emailTemplates = this.mailer.emailTemplates;
    this.mailerSettings = this.config.mailer;

    this.fetchFile = fetchFile(this.db, this.fileStorage);
    this.reprovarIndicacaoService = rejectNominationService(this.db);
    this.useCasesParticipante = getParticipantesUseCases(
      this.db,
      this.siscofWrapper,
      this.fileStorage,
      this.mailer,
      this.mailerSettings,
      this.logger
    );
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

    router.get(
      '/participantes',
      requireBackoffice,
      this.pesquisarParticipantes
    );
    router.get(
      '/estabelecimento/indicacoes',
      requireBackoffice,
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
    // APIs para compatibilidade com o Gateway TODO: Rever forma de consumir essas APIs
    router.get(
      '/fornecedor/:fornecedorId/estabelecimento/:estabelecimentoId/vinculo',
      requireFornecedor,
      somenteFornecedor,
      this.obterValorVinculo
    );
    return router;
  }

  pesquisarParticipantes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const participantes = await this.useCasesParticipante.searchParticipant(req.query.term);
      res.send(participantes);
    } catch (error) {
      next(error);
    }
  }

  pesquisarIndicacoesEc = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { query } = req;
      const nominations = await this.useCasesParticipante.searchEcNomination(query);
      res.send(nominations);
    } catch (error) {
      next(error);
    }
  }

  indicarFornecedor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const estabelecimentoComercialId = +req.user.participante;
      const { documento, nome, email, telefone, participanteFornecedor } = req.body;

      await this.useCasesParticipante
        .indicateProvider(nome, email, telefone, documento, participanteFornecedor, estabelecimentoComercialId);

      return res.end();
    } catch (error) {
      return next(error);
    }
  }

  vincular = (solicitadoEstabelecimento) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { participante, email } = req.user;
        const { estabelecimentoComercialId, fornecedorId } = req.body;
        await this.useCasesParticipante.link(
          solicitadoEstabelecimento,
          participante,
          email,
          estabelecimentoComercialId,
          fornecedorId);
        res.end();
      } catch (error) {
        next(error);
      }
    };
  }

  vincularFornecedor = this.vincular(true);
  vincularEstabelecimento = this.vincular(false);

  obterVinculos = (identityName: string, solicitadoEstabelecimento: boolean) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const id = +req.user.participante;
        const statusVinculo = +req.query.status;
        const vinculos = await this.useCasesParticipante
          .getBonds(identityName, solicitadoEstabelecimento, id, statusVinculo);
        res.send(vinculos);
      } catch (error) {
        next(error);
      }
    };
  }

  obterEstabelecimentoVinculos = this.obterVinculos(
    'participanteEstabelecimento', true
  );

  obterFornecedoresIndicados = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const establishment = +req.user.participante;

      const fornecedoresIndicados = await this.useCasesParticipante.getProviderNominees(establishment);
      res.send(fornecedoresIndicados);
    } catch (error) {
      next(error);
    }
  }

  updateFornecedorIndicado = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const idEc = +req.user.participante;
      const indication = req.body;

      await this.useCasesParticipante.updateProviderNominees(indication, idEc);
      res.end();
    } catch (error) {
      next(error);
    }
  }

  obterFornecedorVinculos = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fornecedorId = +req.user.participante;
      const {
        status,
        nome,
        documento,
        dataCadastroInicio,
        dataCadastroFim,
      } = req.query;

      const providerBonds = await getProviderLinksUseCase(this.db, this.siscofWrapper)(
        fornecedorId,
        status,
        nome,
        documento,
        dataCadastroInicio,
        dataCadastroFim
      );
      res.send(providerBonds);
    } catch (error) {
      next(error);
    }
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

      try {
        const vinculos = await this.useCasesParticipante.getProviderBonds(
          id,
          estabelecimentoId,
          novoStatus,
          req.user.email,
          +req.body.motivoTipoRecusaId,
          req.body.observacao
        );

        try {
          await this.notificarIndicacao(vinculos);
        } catch (error) {
          this.logger.error(error);
        }

        res.end();
      } catch (error) {
        next(error);
      }
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
