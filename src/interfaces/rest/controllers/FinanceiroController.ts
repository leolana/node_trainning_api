import { Router, Response, NextFunction } from 'express';
import { Request } from 'express-request';
import { injectable, inject } from 'inversify';
import { DateTime } from 'luxon';
import { NOT_FOUND } from 'http-status-codes';
import { Sequelize } from '../../../types/sequelize-database';

import { typeEnum as tiposParticipante } from '../../../domain/services/participante/typeEnum';
import  { getFinanceiroUseCases, FinanceiroUseCases } from '../../../domain/usecases/financeiro';
import Controller from '../Controller';
import { LoggerInterface } from '../../../infra/logging';
import { SiscofWrapper } from '../../../infra/siscof';
import { Auth } from '../../../infra/auth';

import types from '../../../constants/types';

@injectable()
class FinanceiroController implements Controller {
  db: Sequelize;
  logger: LoggerInterface;
  siscofWrapper: SiscofWrapper;
  auth: Auth;
  usecases: FinanceiroUseCases;

  constructor(
    @inject(types.Database) db: Sequelize,
    @inject(types.AuthFactory) auth: () => Auth,
    @inject(types.Logger) logger: LoggerInterface,
    @inject(types.SiscofWrapper) siscofWrapper: SiscofWrapper,
  ) {
    this.db = db;
    this.logger = logger;
    this.siscofWrapper = siscofWrapper;
    this.auth = auth();

    this.usecases = getFinanceiroUseCases(db, siscofWrapper);
  }

  get router(): Router {
    const router = Router();

    const require = this.auth.requireParticipante(
      tiposParticipante.estabelecimento,
      tiposParticipante.fornecedor,
    );

    router.get(
      '/financeiro/bandeiras',
      require,
      this.obterOpcoesBandeiras,
    );
    router.get(
      '/financeiro/tipos-operacao',
      require,
      this.obterOpcoesTipoOperacao,
    );
    router.get(
      '/financeiro/resumo',
      require,
      this.obterTransacoesResumo,
    );
    router.post('/financeiro/analitico', require, this.obterAnalitico);

    router.get(
      '/financeiro/relatorio-consolidado-fornecedor',
      this.auth.requireParticipante(tiposParticipante.fornecedor),
      this.obterRelatorioConsolidadoFornecedor
    );
    router.post(
      '/relatorio/export',
      require,
      this.exportRelatorio
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

  private getInfoParticipante = id => this.db.entities.participante.findOne({
    attributes: ['documento', 'nome', 'razaoSocial', 'id'],
    where: { id },
  })

  private getBandeiras = () => this.db.entities.bandeira
    .findAll({
      attributes: ['id', 'nome'],
      order: ['id'],
    })
    .then((data) => {
      const bandeiras = data.map(d => ({
        id: d.id,
        descricao: d.nome,
      }));
      return bandeiras;
    })

  private getBandeiraDict = (bandeiras) => {
    const result = {};
    bandeiras.forEach((b) => {
      result[b.id] = b.descricao;
    });
    return result;
  }

  obterOpcoesBandeiras = async (req: Request, res: Response, next: NextFunction) => {
    return this.getBandeiras()
      .then(data => res.send(data))
      .catch(next);
  }

  obterOpcoesTipoOperacao = async (req: Request, res: Response, next: NextFunction) => this.db.entities.evento
    .findAll({
      attributes: ['id', 'nome'],
      where: {
        // tslint:disable-next-line:no-magic-numbers
        id: [1, 2, 3, 4, 32, 33, 34, 101, 102, 112, 113, 114, 121, 122],
      },
      order: ['id'],
    })
    .then((data) => {
      const tipos = data.map(d => ({
        id: d.id,
        descricao: d.nome,
      }));
      res.send(tipos);
    })
    .catch(next)

  handleRelatorioError = async (error, res, participante) => {
    if (error.statusCode === NOT_FOUND) {
      return res.send({
        razaoSocial: participante.razaoSocial,
        nomeFantasia: participante.nome,
        documento: participante.documento,
        id: participante.id,
        data: [],
      });
    }
    throw error;
  }

  obterTransacoesResumo = async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Quando o CNPJ estiver no contexto, utilizar
    // o do contexto e não dar mais um hit no banco.
    return this.getInfoParticipante(req.user.participante)
      .then((participante) => {
        if (!participante) throw new Error('estabelecimento-nao-encontrado');

        Promise.all([
          this.siscofWrapper.extratoResumido(req.user.participante),
          this.getBandeiras(),
        ])
          .then((data) => {
            const consolidado = data[0].consolidados;
            const bandeiras = this.getBandeiraDict(data[1]);
            consolidado.forEach((a) => {
              a.bandeira = bandeiras[a.bandeira];
            });

            res.send({
              razaoSocial: participante.razaoSocial,
              nomeFantasia: participante.nome,
              documento: participante.documento,
              id: participante.id,
              data: consolidado,
            });
          })
          .catch(error => this.handleRelatorioError(error, res, participante));
      })
      .catch(next);
  }

  obterAnalitico = async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Quando o CNPJ estiver no contexto, utilizar
    // o do contexto e não dar mais um hit no banco.
    return this.getInfoParticipante(req.user.participante)
      .then((participante) => {
        if (!participante) throw new Error('participante-nao-encontrado');

        const filters = req.body
          ? {
            participante: req.user.participante,
            dataVendaInicial: DateTime.fromISO(
              req.body.dataVendaInicial
            ).startOf('day').toISODate(),
            dataVendaFinal: DateTime.fromISO(
              req.body.dataVendaFinal
            ).endOf('day').toISODate(),
            dataPagamentoInicial: DateTime.fromISO(
              req.body.dataPagamentoInicial
            ).startOf('day').toISODate(),
            dataPagamentoFinal: DateTime.fromISO(
              req.body.dataPagamentoFinal,
            ).endOf('day').toISODate(),
            idBandeira: req.body.idBandeira,
            statusTransacao: req.body.statusTransacao,
            statusPagamento: req.body.statusPagamento,
            tipoOperacao: req.body.tipoOperacao,
            posId: req.body.posId,
          }
          : {
            participante: req.user.participante,
          };
        Promise.all([
          this.siscofWrapper.extratoDetalhado(filters),
          this.getBandeiras(),
        ])
          .then((data) => {
            const analitico = data[0].movimentos;
            const bandeiras = this.getBandeiraDict(data[1]);
            analitico.forEach((a) => {
              a.bandeira = bandeiras[a.bandeira];
            });

            res.send({
              razaoSocial: participante.razaoSocial,
              nomeFantasia: participante.nome,
              documento: participante.documento,
              id: participante.id,
              data: analitico,
            });
          })
          .catch(error => this.handleRelatorioError(error, res, participante));
      })
      .catch(next);
  }

  obterRelatorioConsolidadoFornecedor = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.query) {
      throw new Error('missing-req-query');
    }

    const diasPeriodo = req.query.period && +req.query.period;

    const promise = this.usecases
      .listConsolidatedDataForProvider(req.user.participante, diasPeriodo);

    return promise
      .then(data => res.send(data))
      .catch(next);
  }

  exportRelatorio = async (req: Request, res: Response, next: NextFunction) => {
    return this.usecases
      .exportRelatorio(req.body)
      .then(excel => this.sendBlobResponse(
        { Body: excel, ContentType: 'application/vnd.ms-excel', filename: 'relatorioDetalhado.xlsx' }, res))
      .catch(next);
  }
}

export default FinanceiroController;
