import { Router, Response, NextFunction } from 'express';
import { Request } from 'express-request';
import { injectable, inject } from 'inversify';
import { Sequelize } from 'sequelize-database';
import * as R from 'ramda';

import Controller from '../Controller';
import Auth from '../../../infra/auth/Auth';
import { Mailer } from '../../../infra/mailer';
import installmentOptions from '../../../domain/services/cessao/installmentOptions';
import newInstallment from '../../../domain/usecases/cessao/newInstallment';
import findCurrentByType from '../../../domain/services/termo/findCurrentByType';
import cessaoStatusEnum from '../../../domain/services/cessao/cessaoStatusEnum';
import termoTypeEnum from '../../../domain/services/termo/termoTypeEnum';
import cessaoTypeEnum from '../../../domain/services/cessao/cessaoTypeEnum';
import participanteVinculoStatus from '../../../domain/entities/participanteVinculoStatus';
import { typeEnum } from '../../../domain/services/participante/typeEnum';
import SiscofWrapper from '../../../infra/siscof/SiscofWrapper';
import { rolesEnum as roles } from '../../../domain/services/auth/rolesEnum';
import { Environment, MailerEnv } from '../../../infra/environment/Environment';
import CessionService from '../../../domain/services/CessionService';

import types from '../../../constants/types';
import requestCessionUseCase from '../../../domain/usecases/cessao/requestCessionUseCase';
import { LoggerInterface } from '../../../infra/logging/LoggerInterface';

@injectable()
class CessaoController implements Controller {
  db: Sequelize;
  mailer: Mailer;
  emailTemplates: any;
  cessionService: CessionService;
  siscofWrapper: SiscofWrapper;
  mailerConfig: MailerEnv;
  auth: Auth;

  constructor(
    @inject(types.Database) db: Sequelize,
    @inject(types.AuthFactory) auth: () => Auth,
    @inject(types.MailerFactory) mailer: () => Mailer,
    @inject(types.Environment) config: Environment,
    @inject(types.SiscofWrapper) siscofWrapper: SiscofWrapper,
    @inject(types.CessionService) cessionService: CessionService,
    @inject(types.Logger) private logger: LoggerInterface,
  ) {
    this.db = db;
    this.auth = auth();
    this.siscofWrapper = siscofWrapper;
    this.cessionService = cessionService;
    this.mailer = mailer();
    this.emailTemplates = this.mailer.emailTemplates;
    this.mailerConfig = config.mailer;
  }

  get router(): Router {
    const router = Router();

    const requireFornecedor = this.auth.require(
      roles.boAdministrador,
      roles.boOperacoes,
      roles.fcAdministrador,
      roles.fcFinanceiro,
      roles.fcComercial,
    );
    const requireEstabelecimento = this.auth.require(
      roles.boAdministrador,
      roles.boOperacoes,
      roles.ecAdministrador,
      roles.ecFinanceiro,
      roles.ecCompras,
    );

    router.get(
      '/fornecedor/cessoes',
      requireFornecedor,
      this.auth.requireParticipante(typeEnum.fornecedor),
      this.obterCessoes,
    );
    router.get(
      '/fornecedor/cessao/:id',
      requireFornecedor,
      this.auth.requireParticipante(typeEnum.fornecedor),
      this.obterCessao,
    );
    router.get(
      '/fornecedor/:vinculoId/recorrente',
      requireFornecedor,
      this.auth.requireParticipante(typeEnum.fornecedor),
      this.obterDisponibilidadeRecorrentes,
    );
    router.get(
      '/estabelecimento/cessoes',
      requireEstabelecimento,
      this.auth.requireParticipante(typeEnum.estabelecimento),
      this.obterCessoes,
    );
    router.get(
      '/estabelecimento/:estabelecimentoId/cessao/:id',
      requireEstabelecimento,
      this.auth.requireParticipante(typeEnum.estabelecimento),
      this.obterCessao,
    );
    router.post(
      '/estabelecimento/:estabelecimentoId/cessao/:id/alterar',
      requireFornecedor,
      this.auth.requireParticipante(typeEnum.fornecedor),
      this.alterarCessao,
    );
    router.post(
      '/estabelecimento/:estabelecimentoId/cessao/:id/aprovar',
      requireEstabelecimento,
      this.auth.requireParticipante(typeEnum.estabelecimento),
      this.aprovarCessao,
    );
    router.post(
      '/estabelecimento/:estabelecimentoId/cessao/:id/reprovar',
      requireEstabelecimento,
      this.auth.requireParticipante(typeEnum.estabelecimento),
      this.reprovarCessao,
    );

    router.get(
      '/fornecedor/:vinculoId/opcoesParcelamento',
      requireFornecedor,
      this.auth.requireParticipante(typeEnum.fornecedor),
      this.buscarOpcoesParcelamento,
    );
    router.post(
      '/fornecedor/:vinculoId/cessaoParcelada',
      requireFornecedor,
      this.auth.requireParticipante(typeEnum.fornecedor),
      this.solicitarCessaoParcelada,
    );

    // APIs para compatibilidade com o Gateway
    // TODO: Rever forma de consumir essas APIs
    router.get(
      '/fornecedor/:fornecedorId/cessoes',
      requireFornecedor,
      this.auth.requireParticipante(typeEnum.fornecedor),
      this.obterCessoes,
    );
    router.get(
      '/fornecedor/:fornecedorId/cessao/:id',
      requireFornecedor,
      this.auth.requireParticipante(typeEnum.fornecedor),
      this.obterCessao,
    );
    router.post(
      '/fornecedores/solicitarCessao',
      this.auth.requireParticipante(typeEnum.fornecedor),
      this.requestCession
    );

    return router;
  }

  private now = new Date();
  private today = new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate());

  private participanteTypes = {
    fornecedor: 'fornecedor',
    estabelecimento: 'estabelecimento',
  };

  private eventosDoTipoAjuste = {
    123: '.',
    133: '.',
  };

  private getEntity = (req) => {
    const isFornecedor = req.user.participanteFornecedor;
    const fromParticipanteType = isFornecedor
      ? this.db.entities.participanteFornecedor
      : this.db.entities.participanteEstabelecimento;

    return {
      dbSet: fromParticipanteType,
      type: isFornecedor
        ? this.participanteTypes.fornecedor
        : this.participanteTypes.estabelecimento,
    };
  }

  private referenceParticipanteType = type => ({
    model:
      type === this.participanteTypes.fornecedor
        ? this.db.entities.participanteEstabelecimento
        : this.db.entities.participanteFornecedor,
    as:
      type === this.participanteTypes.fornecedor ? 'estabelecimento' : 'fornecedor',
    include: [
      {
        model: this.db.entities.participante,
        as: 'participante',
        attributes: ['nome', 'documento'],
      },
    ],
  })

  private checaCessaoExpirada = (cessao) => {
    if (cessao.status === cessaoStatusEnum.aguardandoAprovacao) {
      const passouExpiracao = new Date(cessao.dataExpiracao) < this.today;
      const passouVencimento = new Date(cessao.dataVencimento) < this.today;

      if (passouExpiracao || passouVencimento) {
        cessao.status = cessaoStatusEnum.expirada;
      }
    }

    return cessao.status === cessaoStatusEnum.expirada;
  }

  private listarCessoesDetalhe = (cessao, vinculo) => {
    const action = this.siscofWrapper
      .listarCessoesDetalhe(cessao, vinculo)
      .then((resultSiscof) => {
        resultSiscof.recebiveis.forEach((recebivel) => {
          recebivel.cessaoId = cessao.id;
        });
        this.db.entities.cessaoRecebivel
          .destroy({
            where: { cessaoId: cessao.id },
          })
          .then(() => {
            this.db.entities.cessaoRecebivel.bulkCreate(resultSiscof.recebiveis);
            this.db.entities.cessaoRecebivelHistorico.bulkCreate(
              resultSiscof.recebiveis,
            );
          });
        return resultSiscof;
      });
    return (action);
  }

  private approveCession = (aprovado) => {
    const action = (req: Request, res: Response, next: NextFunction) => {
      const participanteId = +req.user.participante;
      const cessaoId = +req.body.id;

      // Sempre buscar o termo vigente na aprovação
      return findCurrentByType(this.db)(termoTypeEnum.aditivo)
        .then((termo) => {
          const promise = this.cessionService.aprovarReprovarCessao(
            aprovado,
            participanteId,
            cessaoId,
            termo.id,
            req.user.email,
          );
          return (promise);
        })
        .then(() => res.end())
        .catch(next);
    };
    return (action);
  }

  obterCessoes = async (req: Request, res: Response, next: NextFunction) => {
    const id = +req.user.participante;
    const entity = this.getEntity(req);
    const getParticipante = () => {
      return entity.dbSet.findOne({
        where: { participanteId: id },
        include: [
          {
            model: this.db.entities.participanteVinculo,
            as: 'vinculos',
            attributes: ['id'],
            include: [
              this.referenceParticipanteType(entity.type),
              {
                model: this.db.entities.cessao,
                as: 'cessoes',
                attributes: [
                  'id',
                  'status',
                  'valorSolicitado',
                  'createdAt',
                  'dataExpiracao',
                  'dataVencimento',
                  'referencia',
                  'dataRespostaEstabelecimento',
                  'codigoCessao',
                  'tipo',
                  'diluicaoPagamento',
                ],
              },
            ],
          },
        ],
        order: [
          [
            { model: this.db.entities.participanteVinculo, as: 'vinculos' },
            { model: this.db.entities.cessao, as: 'cessoes' },
            'createdAt', 'DESC'
          ]
        ]
      });
    };

    return getParticipante()
      .then((queryResult) => {
        if (!queryResult || !queryResult.vinculos) {
          res.send({});
          return;
        }

        const map = (cessao, vinculo) => {
          const person = (vinculo.fornecedor || vinculo.estabelecimento)
            .participante;

          return {
            codigo: cessao.id,
            valorSolicitado: cessao.valorSolicitado,
            nome: person.nome,
            documento: person.documento,
            data: cessao.createdAt,
            dataExpiracao: cessao.dataExpiracao,
            dataVencimento: cessao.dataVencimento,
            dataResposta: cessao.dataRespostaEstabelecimento,
            referencia: cessao.referencia,
            codigoCessao: cessao.codigoCessao,
            tipoCessao: cessao.tipo,
            tipoDiluicaoPagamento: cessao.diluicaoPagamento,
          };
        };

        const sortByCessaoDesc = R.sortWith([
          R.descend(R.prop('data')),
        ]);

        const extractCessoes = () => {
          const listagem = {};
          queryResult.vinculos.forEach((vinculo) => {
            vinculo.cessoes.forEach((cessao) => {
              this.checaCessaoExpirada(cessao);

              if (!listagem[cessao.status]) {
                listagem[cessao.status] = [];
              }

              const novaCessao = map(cessao, vinculo);
              listagem[cessao.status].push(novaCessao);
            });
          });

          return listagem;
        };

        const sortByListagemCessoes = (listaCessoes) => {
          const listagem = {};
          for (const cessoes in listaCessoes) {
            listagem[cessoes] = sortByCessaoDesc(listaCessoes[cessoes]);
          }

          return listagem;
        };

        const listagemCessoes = extractCessoes();
        const listagemCessoesOrdenadas = sortByListagemCessoes(listagemCessoes);

        res.send(listagemCessoesOrdenadas);
      })
      .catch(next);
  }

  obterCessao = async (req: Request, res: Response, next: NextFunction) => {
    const participanteId = +req.user.participante;
    const cessaoId = +req.params.id;
    const entity = this.getEntity(req);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const collection: any = {};

    const listEventos = () => {
      return this.db.entities.evento
        .findAll({
          attributes: ['id', 'nome'],
        })
        .then((arr) => {
          collection.eventos = arr;
        });
    };

    const listBandeiras = () => {
      return this.db.entities.bandeira
        .findAll({
          where: {
            ativo: true,
          },
          attributes: ['id', 'nome'],
        })
        .then((arr) => {
          collection.bandeiras = arr;
        });
    };

    const get = () => {
      return entity.dbSet
        .findOne({
          where: { participanteId },
          include: [
            {
              model: this.db.entities.participanteVinculo,
              as: 'vinculos',
              include: [
                {
                  model: this.db.entities.cessao,
                  as: 'cessoes',
                  where: { id: cessaoId },
                  attributes: [
                    'id',
                    'valorSolicitado',
                    'valorDisponivel',
                    'dataExpiracao',
                    'status',
                    'tipo',
                    'diluicaoPagamento',
                    'dataVencimento',
                    ['createdAt', 'dataSolicitacao'],
                    'solicitante',
                    ['dataRespostaEstabelecimento', 'dataReposta'],
                    ['usuarioRespostaEstabelecimento', 'responsavelRespota'],
                    'codigoCessao',
                    'referencia',
                    'numeroParcelas',
                  ],
                },
                {
                  model: this.db.entities.participanteVinculoRecorrente,
                  as: 'recorrentes',
                  attributes: ['valorMaximo', 'dataFinalVigencia'],
                  where: {
                    status: [participanteVinculoStatus.pendente, participanteVinculoStatus.aprovado],
                    dataFinalVigencia: {
                      $gte: today,
                    },
                  },
                  required: false,
                },
                this.referenceParticipanteType(this.participanteTypes.estabelecimento),
                this.referenceParticipanteType(this.participanteTypes.fornecedor),
              ],
            },
          ],
        })
        .then((participante) => {
          if (!participante) {
            throw new Error('participante-nao-encontrado');
          }
          if (!participante.vinculos.length) {
            throw new Error('vinculo-nao-encontrado');
          }
          if (!participante.vinculos[0].cessoes.length) {
            throw new Error('cessao-nao-encontrada');
          }

          const vinculo = participante.vinculos[0];
          const cessao = vinculo.cessoes[0].dataValues;

          if (cessao.tipo === cessaoTypeEnum.recorrenteAprovacaoAutomatica) {
            if (!vinculo.recorrentes.length) {
              throw new Error('vinculo-cessao-recorrente-nao-encontrado');
            }
            const recorrencia = vinculo.recorrentes[0].dataValues;
            cessao.recorrencia = {
              valorMaximoRecorrente: recorrencia.valorMaximo,
              dataExpiracaoRecorrente: recorrencia.dataFinalVigencia,
            };
          }

          if (this.checaCessaoExpirada(cessao)) {
            cessao.status = cessaoStatusEnum.expirada;
          }

          return this.listarCessoesDetalhe(cessao, vinculo).then((siscofResult) => {
            const { recebiveis } = siscofResult;
            if (!recebiveis) {
              throw new Error('sem-recebiveis');
            }

            Object.assign(cessao, {
              tipoCessao: cessao.tipo,
              tipoDiluicaoPagamento: cessao.diluicaoPagamento,
              fornecedor: vinculo.fornecedor.participante.dataValues,
              estabelecimento: vinculo.estabelecimento.participante.dataValues,
            });

            // group
            const parcelas = {};

            recebiveis.forEach((r) => {
              const parcela = parcelas[r.numeroParcelaCessao]
                || (parcelas[r.numeroParcelaCessao] = {
                  itens: {},
                  ajustes: {},
                  numeroParcelaCessao: r.numeroParcelaCessao,
                });

              const categoria = (r.eventoId in this.eventosDoTipoAjuste)
                ? parcela.ajustes
                : parcela.itens;

              const diaPagamento = categoria[r.dataPagarEc]
                || (categoria[r.dataPagarEc] = []);

              Object.assign(r, {
                bandeiraId: r.bandeira,
                bandeira: collection.bandeiras.find(i => i.id === +r.bandeira),
                evento: collection.eventos.find(i => i.id === +r.eventoId),
              });

              diaPagamento.push(r);
            });

            // map and sort
            cessao.parcelas = Object
              .values(parcelas)
              .sort((x: any, y: any) => x.numeroParcelaCessao - y.numeroParcelaCessao);
            const mapRecebiveis = (parcela, categoria) => {
              parcela[categoria] = Object
                .keys(parcela[categoria])
                .map((date) => {
                  const data = new Date(date).toISOString();
                  const objData = {
                    data,
                    recebiveis: parcela[categoria][date],
                    total: parcela[categoria][date]
                      .reduce((acc, x) => acc + x.valorPagarEc, 0),
                  };
                  parcela.total += objData.total;
                  return objData;
                });
            };

            cessao.parcelas.forEach((parcela) => {
              parcela.total = 0;

              mapRecebiveis(parcela, 'itens');
              mapRecebiveis(parcela, 'ajustes');
            });
            cessao.totalRecebiveis = cessao.parcelas
              .reduce((acc, parcela) => acc + parcela.total, 0);

            return Promise.resolve(cessao);
          });
        })
        .then(result => res.send(result))
        .catch((error) => {
          throw error;
        });

    };

    return Promise.all([listEventos(), listBandeiras()]).then(get);
  }

  obterDisponibilidadeRecorrentes = async (req: Request, res: Response, next: NextFunction) => {
    return this.cessionService
      .verificaRecorrenciaPorIdVinculo(+req.params.vinculoId)
      .then(retorno => res.send(retorno))
      .catch(next);
  }

  aprovarCessao = this.approveCession(true);

  reprovarCessao = this.approveCession(false);

  alterarCessao = async (req: Request, res: Response, next: NextFunction) => {
    const cessaoId = +req.body.id;
    const participanteId = req.user.participante;

    const get = () => {
      return this.db.entities.participanteVinculo.findOne({
        attributes: ['id'],
        where: {
          $or: {
            participanteEstabelecimentoId: participanteId,
            participanteFornecedorId: participanteId,
          },
        },
        include: [
          {
            model: this.db.entities.cessao,
            as: 'cessoes',
            where: {
              id: cessaoId,
            },
            required: true,
          },
        ],
      });
    };

    const update = (vinculo) => {
      if (!vinculo || vinculo.cessoes.length === 0) {
        throw new Error('cessao-nao-encontrada');
      }

      const cessao = vinculo.cessoes[0];
      const now = new Date();

      const dataExpiracao = new Date(req.body.dataExpiracao);
      const dataMinExpiracao = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
      );

      if (dataExpiracao < dataMinExpiracao) {
        throw new Error('data-expiracao-anterior-prox-dia');
      }

      if (dataExpiracao > new Date(cessao.dataVencimento)) {
        throw new Error('data-expiracao-posterior-vencimento');
      }

      cessao.dataExpiracao = req.body.dataExpiracao;
      cessao.referencia = req.body.referencia;
      cessao.usuario = req.user.email;

      return cessao.save();
    };

    return get()
      .then(update)
      .then(() => res.end())
      .catch(next);
  }

  buscarOpcoesParcelamento = async (req: Request, res: Response, next: NextFunction) => {
    const vinculoId = +req.params.vinculoId;
    const valorSolicitado = +req.query.valor;
    const dataVencimento = new Date(req.query.dataVencimento);

    const getVinculo = () => {
      return this.db.entities.participanteVinculo.findOne({
        where: { id: vinculoId },
        attributes: [
          'participanteEstabelecimentoId',
          'participanteFornecedorId',
        ],
      });
    };

    const getOptions = (vinculo) => {
      return installmentOptions(this.siscofWrapper)(
        vinculo.participanteFornecedorId,
        vinculo.participanteEstabelecimentoId,
        dataVencimento,
        valorSolicitado,
      );
    };

    return getVinculo()
      .then(vinculo => getOptions(vinculo))
      .then(options => res.send(options))
      .catch(next);
  }

  requestCession = async (req: Request, res: Response, next: NextFunction) => {
    const linkId = +req.body.vinculoId;
    const { tipo } = req.body;

    try {
      const cessionId = await
        requestCessionUseCase(
          this.db, this.siscofWrapper, this.mailer, this.mailerConfig, this.logger)(req.body, linkId, tipo, req.user);
      res.send({ id: cessionId });
    } catch (err) { next(err); }
  }

  solicitarCessaoParcelada = async (req: Request, res: Response, next: NextFunction) => {
    const vinculoId = +req.params.vinculoId;
    const diluicao = +req.body.pagamento;
    const valorCessao = +req.body.valorCessao;
    const dataVencimento = new Date(req.body.dataVencimento);
    const dataExpiracao = new Date(req.body.dataExpiracao);
    const referencia = String(req.body.referencia);
    const numParcelasEscolhido = +req.body.parcelamento;
    const userId = +req.user.participante;
    const userEmail = String(req.user.email);
    const userName = String(req.user.name);

    const action = newInstallment(
      this.db,
      this.siscofWrapper,
      this.mailer,
      this.emailTemplates,
      this.mailerConfig,
    )(
      vinculoId,
      diluicao,
      valorCessao,
      dataVencimento,
      dataExpiracao,
      referencia,
      numParcelasEscolhido,
      userId,
      userEmail,
      userName,
    );

    return action
      .then(cession => res.send(cession))
      .catch(next);
  }
}

export default CessaoController;
