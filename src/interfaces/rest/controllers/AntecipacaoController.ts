import { Router, Response, NextFunction } from 'express';
import { Request } from 'express-request';
import { injectable, inject } from 'inversify';
import { DateTime } from 'luxon';
import { Sequelize } from 'sequelize-database';

import Controller from '../Controller';
import antecipacao from '../../../domain/usecases/antecipacao';
import { SiscofWrapper } from '../../../infra/siscof';
import { LoggerInterface } from '../../../infra/logging';

import types from '../../../constants/types';
import * as Exceptions from '../exceptions/ApiExceptions';

@injectable()
class AntecipacaoController implements Controller {
  siscofWrapper: SiscofWrapper;
  db: Sequelize;
  logger: LoggerInterface;
  anticipation: any;

  constructor(
    @inject(types.Database) db: Sequelize,
    @inject(types.Logger) logger: LoggerInterface,
    @inject(types.SiscofWrapper) siscofWrapper: SiscofWrapper
  ) {
    this.siscofWrapper = siscofWrapper;
    this.db = db;
    this.logger = logger;

    this.anticipation = antecipacao(
      db,
      siscofWrapper,
    );
  }

  get router(): Router {
    const router = Router();

    router.post('/antecipacao/recebiveis', this.obterRecebiveis);
    router.post('/antecipacao/realizadas', this.obterRealizadas);
    router.post('/antecipacao/solicitar', this.solicitarAntecipacao);
    router.get('/antecipacao/meses', this.obterComboMeses);
    router.get('/antecipacao/produtos', this.obterComboProdutos);
    router.get(
      '/antecipacao/produtos-antecipacao-realizada',
      this.obterComboProdutosAntecipacaoRealizada);
    router.get('/antecipacao/hora-limite', this.obterHoraLimite);

    return router;
  }

  obterRecebiveis = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body || {};
      const participanteId = req.user.participante;
      const mes = body.mes || null;

      let mesInicio = null;
      let mesFim = null;
      let produtosId = body.produtoId || body.produtosId || null;
      let bandeirasId = body.bandeirasId || null;
      const dataVendaInicio = body.dataVendaInicio
        ? DateTime.fromISO(body.dataVendaInicio).toISODate()
        : null;

      const dataVendaFim = body.dataVendaFim
        ? DateTime.fromISO(body.dataVendaFim).toISODate()
        : null;

      if (bandeirasId instanceof Array) {
        bandeirasId = bandeirasId.length === 0
          ? null : bandeirasId.map(id => +id);
      }

      if (produtosId instanceof Array) {
        produtosId = produtosId.length === 0 ? null : produtosId.map(id => +id);
      } else if (produtosId) {
        produtosId = [produtosId];
      }

      if (mes) {
        mesInicio = DateTime.fromISO(mes).set({ day: 1 }).toISODate();
        mesFim = DateTime.fromISO(mes).endOf('month').toISODate();
      }

      const recebiveis = await this.anticipation.listReceivables(
        participanteId,
        mesInicio,
        mesFim,
        produtosId,
        bandeirasId,
        dataVendaInicio,
        dataVendaFim
      );
      res.send(recebiveis);

    } catch (error) {
      next(error);
    }
  }

  obterRealizadas = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body || {};

      const codigo = body.codigo || null;
      const participanteId = req.user.participante;
      const mes = body.mes || null;

      const dataPagamento = body.dataPagamento
        ? new Date(body.dataPagamento)
        : null;

      const dataSolicitacao = body.dataSolicitacao
        ? new Date(body.dataSolicitacao)
        : null;

      const dataSolicitacaoInicio = body.dataSolicitacaoInicio || null;
      const dataSolicitacaoFim = body.dataSolicitacaoFim || null;

      let bandeirasIds = body.bandeirasIds || null;
      if (bandeirasIds instanceof Array) {
        bandeirasIds = bandeirasIds.length === 0
          ? null : bandeirasIds.map(id => +id);
      }

      let produtosId = body.produtoId || null;
      if (produtosId instanceof Array) {
        produtosId = produtosId.length === 0 ? null : produtosId.map(id => +id);
      } else if (produtosId) {
        produtosId = [produtosId];
      }

      const data = await this.anticipation.listRealized(
        participanteId,
        dataPagamento,
        dataSolicitacao,
        bandeirasIds,
        produtosId,
        codigo,
        mes,
        dataSolicitacaoInicio,
        dataSolicitacaoFim
      );
      res.send(data);

    } catch (error) {
      next(error);
    }
  }

  solicitarAntecipacao = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!(req.body.recebiveis || []).length) {
        throw new Exceptions.EmptyReceivablesListException();
      }

      const idParticipante = req.user.participante;
      const user = req.user.email;
      const receivables = req.body.recebiveis;

      await this.anticipation.requestAnticipation(idParticipante, user, receivables);
      res.end();

    } catch (error) {
      next(error);
    }
  }

  obterComboMeses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const quantityMonths = 12;
      const startingDate = new Date();

      const arr = await this.anticipation.getMonthsDropdown(quantityMonths, startingDate);
      res.send(arr);

    } catch (error) {
      next(error);
    }
  }

  obterComboProdutos = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ehEstabelecimento = req.user.participanteEstabelecimento;
      const ehFornecedor = req.user.participanteFornecedor;

      const arr = await this.anticipation.getProductsDropdown(ehEstabelecimento, ehFornecedor);
      res.send(arr);

    } catch (error) {
      next(error);
    }
  }

  obterComboProdutosAntecipacaoRealizada = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const arr = await this.anticipation.getProductsDropdownRealized();
      res.send(arr);

    } catch (error) {
      next(error);
    }
  }

  obterHoraLimite = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hora = await this.anticipation.getHourLimit();
      res.send({ hora });

    } catch (error) {
      next(error);
    }
  }
}

export default AntecipacaoController;
