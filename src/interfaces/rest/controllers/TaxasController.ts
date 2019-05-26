import { Router, Response, NextFunction } from 'express';
import { Request } from 'express-request';
import { injectable, inject } from 'inversify';
import { Sequelize } from 'sequelize-database';

import Controller from '../Controller';
import Auth from '../../../infra/auth/Auth';
import { LoggerInterface } from '../../../infra/logging';
import taxas from '../../../domain/usecases/taxas';

import types from '../../../constants/types';

@injectable()
class TermoController implements Controller {
  auth: Auth;
  db: Sequelize;
  logger: LoggerInterface;
  usecases: any;

  constructor(
    @inject(types.Database) db: Sequelize,
    @inject(types.Logger) logger: LoggerInterface,
  ) {
    this.db = db;
    this.logger = logger;

    this.usecases = taxas(db);
  }

  get router(): Router {
    const router = Router();

    router.get('/dominio/taxas', this.commercialConditions);
    router.get('/taxas', this.getTaxas);
    router.get('/taxa', this.getTaxa);
    router.get('/taxa/prazos', this.getTaxaPrazos);
    router.get('/taxa/ranges', this.getTaxaRanges);
    router.post('/taxa/edit', this.updateTaxa);
    router.post('/taxa/add', this.addTaxa);

    return router;
  }

  commercialConditions = async (req: Request, res: Response, next: NextFunction) => {
    const ramoAtividade = +req.query.ramoAtividade;
    const tipoPessoa = +req.query.tipoPessoa;
    const faturamentoCartao = +req.query.faturamentoCartao;

    return this.usecases
      .commercialConditions(ramoAtividade, tipoPessoa, faturamentoCartao)
      .then(taxa => res.send(taxa))
      .catch(next);
  }

  getTaxas = async (req: Request, res: Response, next: NextFunction) => {
    const idTipoPessoa = +req.query.idTipoPessoa;
    const idRamoAtividade = +req.query.idRamoAtividade;
    const temInicio = req.query.inicioVigencia;
    const inicioVigencia = temInicio ? new Date(temInicio) : null;
    const temFim = req.query.terminoVigencia;
    const terminoVigencia = temFim ? new Date(temFim) : null;

    return this.usecases
      .listFees(idTipoPessoa, idRamoAtividade, inicioVigencia, terminoVigencia)
      .then(list => res.send(list))
      .catch(next);
  }

  getTaxa = async (req: Request, res: Response, next: NextFunction) => {
    const idTaxa = +req.query.id;
    const tipoPessoa = +req.query.idTipoPessoa || null;
    const idRamoAtividade = +req.query.idRamoAtividade || null;
    const inicio = new Date(req.query.inicioVigencia);
    const temFim = req.query.terminoVigencia;
    const fim = temFim ? new Date(temFim) : null;
    const ignoreerror = Boolean(req.query.ignoreerror);

    return this.usecases
      .findFee(idTaxa, tipoPessoa, idRamoAtividade, inicio, fim, ignoreerror)
      .then(taxa => res.send(taxa))
      .catch(next);
  }

  getTaxaPrazos = async (req: Request, res: Response, next: NextFunction) => {
    const action = this.usecases
      .listFeeTerms()
      .then(terms => res.send(terms))
      .catch(next);

    return action;
  }

  getTaxaRanges = async (req: Request, res: Response, next: NextFunction) => {
    const action = this.usecases
      .listFeeTermRanges()
      .then(ranges => res.send(ranges))
      .catch(next);

    return action;
  }

  addTaxa = async (req: Request, res: Response, next: NextFunction) => {
    const json = req.body;
    const usuario = req.user.email;

    return this.usecases
      .addFee(json, usuario)
      .then(taxa => res.send(taxa))
      .catch(next);
  }

  updateTaxa = async (req: Request, res: Response, next: NextFunction) => {
    const json = req.body;
    const usuario = req.user.email;

    return this.usecases
      .updateFee(json, usuario)
      .then(taxa => res.send(taxa))
      .catch(next);
  }
}

export default TermoController;
