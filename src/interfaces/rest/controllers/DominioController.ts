import { Router, Response, NextFunction } from 'express';
import { Request } from 'express-request';
import { injectable, inject } from 'inversify';
import { Sequelize } from '../../../types/sequelize-database';

import Controller from '../Controller';
import Auth from '../../../infra/auth/Auth';
import { LoggerInterface } from '../../../infra/logging';
import { InternalApis } from '../../../infra/internalApis';
import { Mailer } from '../../../infra/mailer';
import tiposPessoa from '../../../domain/entities/tiposPessoa';
import { Environment, MailerEnv } from '../../../infra/environment/Environment';

import types from '../../../constants/types';

@injectable()
class DominioController implements Controller {
  auth: Auth;
  db: Sequelize;
  logger: LoggerInterface;
  internalApis: InternalApis;
  mailer: Mailer;
  emailTemplates: any;
  mailerSettings: MailerEnv;

  constructor(
    @inject(types.Database) db: Sequelize,
    @inject(types.Logger) logger: LoggerInterface,
    @inject(types.InternalApisFactory) internalApis: () => InternalApis,
    @inject(types.MailerFactory) mailer: () => Mailer,
    @inject(types.Environment) config: Environment,
  ) {
    this.db = db;
    this.logger = logger;
    this.internalApis = internalApis();
    this.mailer = mailer();
    this.emailTemplates = this.mailer.emailTemplates;
    this.mailerSettings = config.mailer;
  }

  get router(): Router {
    const router = Router();

    router.get('/dominio/bancos', this.obterOpcoesBanco);
    router.get('/dominio/bandeiras', this.obterOpcoesBandeira);
    router.get('/dominio/endereco/:cep', this.obterEndereco);
    router.get('/dominio/capturas', this.obterOpcoesCaptura);
    router.get('/dominio/cidades', this.pesquisarCidades);
    router.get('/dominio/eventos', this.obterOpcoesEvento);
    router.get('/dominio/faturamento-cartao', this.obterOpcoesFaturamentoCartao);
    router.get('/dominio/ramos-atividade', this.pesquisarRamosAtividade);
    router.get('/dominio/ticket-medio', this.obterOpcoesTicketMedio);

    return router;
  }

  private now = new Date();
  private today = new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate());

  private vigenciaValida = {
    inicio: {
      $lte: this.today,
    },
    fim: {
      $or: {
        $eq: null,
        $gt: this.now
      }
    }
  };

  obterOpcoesBanco = async (req: Request, res: Response, next: NextFunction) => {
    return this.internalApis.obterBancos()
      .then(bancos => res.send(bancos))
      .catch(next);
  }

  obterOpcoesBandeira = async (req: Request, res: Response, next: NextFunction) => {
    return this.db.entities.bandeira
      .findAll({
        where: { ativo: true },
        attributes: ['id', 'nome']
      })
      .then(bandeiras => bandeiras.map(b => ({
        id: b.id,
        text: b.nome
      })))
      .then(bandeiras => res.send(bandeiras))
      .catch(next);
  }

  obterEndereco = async (req: Request, res: Response, next: NextFunction) => {
    return this.internalApis.obterEndereco(req.params.cep)
      .then((endereco) => {
        const where: any = this.db.where(
          this.db.fn('unaccent', this.db.col('nome')),
          { $iLike: this.db.fn('unaccent', `%${endereco.cidade}%`) }
        );

        return new Promise((resolve, reject) => {
          if (!endereco.cidade) {
            endereco.cidadeId = 0;
            resolve(endereco);
          }

          this.db.entities.cidade
            .findOne({
              where,
              attributes: ['id'],
              order: [['nome', 'ASC']]
            }).then((cidade) => {
              if (cidade) {
                endereco.cidadeId = cidade.id;
              } else {
                endereco.cidadeId = 0;
              }

              resolve(endereco);
            })
            .catch(reject);
        });
      })
      .then(endereco => res.send(endereco))
      .catch(next);
  }

  obterOpcoesCaptura = async (req: Request, res: Response, next: NextFunction) => {
    return this.db.entities.captura
      .findAll({
        include: [{
          model: this.db.entities.produto,
          attributes: ['id', 'nome'],
        }],
        where: this.vigenciaValida,
        attributes: ['id', 'valor', 'tipoCaptura']
      })
      .then(capturas => res.send(capturas))
      .catch(next);
  }

  obterOpcoesEvento = async (req: Request, res: Response, next: NextFunction) => {
    return this.db.entities.evento
      .findAll({
        attributes: ['id', 'nome']
      })
      .then(eventos => res.send(eventos))
      .catch(next);
  }

  obterOpcoesFaturamentoCartao = async (req: Request, res: Response, next: NextFunction) => {
    return this.db.entities.faturamentoCartao
      .findAll({
        where: { ativo: true },
        attributes: ['id', 'descricao']
      })
      .then(opcoes => opcoes.map(o => ({
        id: o.id,
        text: o.descricao
      })))
      .then(opcoes => res.send(opcoes))
      .catch(next);
  }

  obterOpcoesTicketMedio = async (req: Request, res: Response, next: NextFunction) => {
    return this.db.entities.ticketMedio
      .findAll({
        attributes: ['id', 'descricao']
      })
      .then(opcoes => opcoes.map(o => ({
        id: o.id,
        text: o.descricao
      })))
      .then(opcoes => res.send(opcoes))
      .catch(next);
  }

  pesquisarCidades = async (req: Request, res: Response, next: NextFunction) => {
    let where: any = {};

    if (req.query.term) {
      where = this.db.where(
        this.db.fn('unaccent', this.db.col('nome')),
        { $iLike: this.db.fn('unaccent', `%${req.query.term}%`) }
      );
    }

    if (req.query.id) {
      where.id = req.query.id;
    }

    return this.db.entities.cidade
      .findAll({
        where,
        attributes: ['id', 'nome', 'estado'],
        order: [['nome', 'ASC']]
      })
      .then(cidades => cidades.map(c => ({
        id: c.id,
        text: `${c.nome} - ${c.estado}`
      })))
      .then(cidades => res.send(cidades))
      .catch(next);
  }

  pesquisarRamosAtividade = async (req: Request, res: Response, next: NextFunction) => {
    const where: any = { ativo: true };

    if (req.query.tipoPessoa) {
      if (+req.query.tipoPessoa === tiposPessoa.fisica) {
        where.restritoPJ = false;
      }
    }

    if (req.query.id) {
      where.codigo = +req.query.id;
    }

    if (req.query.term) {
      where.descricao = this.db.where(
        this.db.fn('unaccent', this.db.col('descricao')),
        { $iLike: this.db.fn('unaccent', `%${req.query.term}%`) }
      );
    }

    return this.db.entities.ramoAtividade
      .findAll({
        where,
        attributes: ['codigo', 'descricao']
      })
      .then(ramos => ramos.map(r => ({
        id: r.codigo,
        text: r.descricao
      })))
      .then(ramos => res.send(ramos))
      .catch(next);
  }

  enviarEmail = async (req: Request, res: Response, next: NextFunction) => {
    return this.mailer
      .enviar({
        templateName: this.emailTemplates.DEFINIR_SENHA,
        destinatary: req.user.email,
        substitutions: {
          loginAcesso: 'leonardo.lana',
          linkRedefinirSenha: `${this.mailerSettings.baseUrl}/usuario/definirsenha`
        }
      })
      .then(data => res.send(data))
      .catch(next);
  }
}

export default DominioController;
