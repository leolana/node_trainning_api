// tslint:disable:no-magic-numbers
import { Router, Response, NextFunction } from 'express';
import { Request } from 'express-request';
import { injectable, inject } from 'inversify';
import { Sequelize } from 'sequelize-typescript';

import Controller from '../Controller';
import { LoggerInterface } from '../../../infra/logging';
import { typeEnum as tiposParticipante } from '../../../domain/services/participante/typeEnum';
import Auth from '../../../infra/auth/Auth';
import FileStorage from '../../../infra/fileStorage/FileStorage';
import { Mailer } from '../../../infra/mailer';
import { SiscofWrapper } from '../../../infra/siscof';
import { rolesEnum as roles } from '../../../domain/services/auth/rolesEnum';
import participanteVinculoStatus from '../../../domain/entities/participanteVinculoStatus';
import VinculoService from '../../../domain/services/VinculoService';
import linkStatusEnum from '../../../domain/services/vinculo/linkStatusEnum';
import participanteIndicacaoStatus from '../../../domain/entities/participanteIndicacaoStatus';
import { Environment, MailerEnv } from '../../../infra/environment/Environment';

import types from '../../../constants/types';
import { VinculoUseCase, getVinculoUseCases } from '../../../domain/usecases/vinculo';

@injectable()
class ParticipantesController implements Controller {
  auth: Auth;
  fileStorage: FileStorage;
  mailer: Mailer;
  mailerSettings: MailerEnv;
  emailTemplates: any;
  useCaseVinculo: VinculoUseCase;

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

    this.useCaseVinculo = getVinculoUseCases(this.db, this.siscofWrapper, this.mailer, this.mailerSettings);
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
    // FORNECEDOR
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
      '/fornecedor/estabelecimentos/pendentes',
      requireFornecedor,
      somenteFornecedor,
      this.obterFornecedorVinculosPendentes
    );
    router.get(
      '/fornecedor/:id/vinculos',
      requireBackoffice,
      this.getProviderEstablishment
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

  vincular = (solicitadoEstabelecimento) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { participante, email } = req.user;
        const { estabelecimentoComercialId, fornecedorId } = req.body;
        await this.useCaseVinculo.linkUseCase(
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
        const vinculos = await this.useCaseVinculo
          .getBondsUseCase(identityName, solicitadoEstabelecimento, id, statusVinculo);
        res.send(vinculos);
      } catch (error) {
        next(error);
      }
    };
  }

  obterEstabelecimentoVinculos = this.obterVinculos(
    'participanteEstabelecimento', true
  );

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

      const providerBonds = await this.useCaseVinculo.getProviderLinksUseCase(
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
      this.useCaseVinculo.getProviderNominationUseCase(
        fornecedorId,
        participanteIndicacaoStatus.pendente,
        nome,
        documento,
        dataCadastroInicio,
        dataCadastroFim
      ),
      this.useCaseVinculo.getProviderRequestedLinksUsecase(
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

  notificarVinculos = (vinculo) => {
    const contatoInclude = () => ({
      model: (this.db.models as any).participanteContato,
      as: 'contatos',
      attributes: ['participanteId', 'email'],
      where: { ativo: true },
    });

    const participanteInclude = () => ({
      model: (this.db.models as any).participante,
      as: 'participante',
      attributes: ['id', 'nome'],
      include: [contatoInclude()],
      where: { ativo: true },
    });

    return Promise.all([
      (this.db.models as any).participanteFornecedor.findOne({
        where: { participanteId: vinculo.participanteFornecedorId },
        attributes: ['participanteId'],
        include: [participanteInclude()],
      }),
      (this.db.models as any).participanteEstabelecimento.findOne({
        where: { participanteId: vinculo.participanteEstabelecimentoId },
        attributes: ['participanteId'],
        include: [participanteInclude()],
      }),
    ]).then((results) => {
      const fornecedorData = results[0];
      const estabelecimento = results[1];

      if (vinculo.status === participanteVinculoStatus.aprovado) {
        return this.mailer.enviar({
          templateName: this.emailTemplates.INDICACAO_ESTABELECIMENTO_ACEITA,
          destinatary: fornecedorData.participante.contatos[0].email,
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
          destinatary: fornecedorData.participante.contatos[0].email,
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
        const vinculos = await this.useCaseVinculo.getProviderBondsUseCase(
          id,
          estabelecimentoId,
          novoStatus,
          req.user.email,
          +req.body.motivoTipoRecusaId,
          req.body.observacao
        );

        try {
          await this.notificarVinculos(vinculos);
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
      model: (this.db.models as any).participanteContato,
      as: 'contatos',
      attributes: ['participanteId', 'email'],
      where: { ativo: true },
    });

    const participanteInclude = () => ({
      model: (this.db.models as any).participante,
      as: 'participante',
      attributes: ['id', 'nome'],
      include: [contatoInclude()],
      where: { ativo: true },
    });

    return Promise.all([
      (this.db.models as any).participanteFornecedor.findOne({
        where: { participanteId: vinculo.participanteFornecedorId },
        attributes: ['participanteId'],
        include: [participanteInclude()],
      }),
      (this.db.models as any).participanteEstabelecimento.findOne({
        where: { participanteId: vinculo.participanteEstabelecimentoId },
        attributes: ['participanteId'],
        include: [participanteInclude()],
      }),
    ]).then((results) => {
      const fornecedorData = results[0];
      const estabelecimento = results[1];

      if (!estabelecimento.participante.contato) {
        return null;
      }

      if (vinculo.exibeValorDisponivel) {
        return this.mailer.enviar({
          templateName: this.emailTemplates.LIBERACAO_VALOR_DISPONIVEL_FORNECEDOR,
          destinatary: estabelecimento.participante.contatos[0].email,
          substitutions: {
            fornecedor: fornecedorData.participante.nome,
            linkAlteracaoValorDisponivel:
              `${this.mailerSettings.baseUrl}/estabelecimento/fornecedores`,
          },
        });
      }

      return this.mailer.enviar({
        templateName: this.emailTemplates.CANCELAMENTO_VALOR_DISPONIVEL_FORNECEDOR,
        destinatary: estabelecimento.participante.contatos[0].email,
        substitutions: {
          fornecedor: fornecedorData.participante.nome,
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

      return (this.db.models as any).participanteVinculo
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
            (this.db.models as any).participanteVinculoHistorico.create({
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
      model: (this.db.models as any).participanteEstabelecimento,
      as: 'estabelecimento',
      include: [{
        model: (this.db.models as any).participante,
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

  getProviderEstablishment = async (req: Request, res: Response, next: NextFunction) => this.useCaseVinculo
    .myEstablishmentsUseCase(+req.params.id)
    .then(data => res.send(data))
    .catch(next)

}

export default ParticipantesController;
