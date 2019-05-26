import { Router, Response, NextFunction } from 'express';
import { Request } from 'express-request';
import { injectable, inject } from 'inversify';
import { Sequelize } from 'sequelize-database';
import Controller from '../Controller';
import { LoggerInterface } from '../../../infra/logging';
import credenciamentoStatusEnum from '../../../domain/entities/credenciamentoStatusEnum';
import participanteVinculoStatus from '../../../domain/entities/participanteVinculoStatus';
import cessaoStatus from '../../../domain/entities/cessaoStatus';
import participateNominationSourceEnum from '../../../domain/entities/participateNominationSourceEnum';
import { rolesEnum } from '../../../domain/services/auth/rolesEnum';

import types from '../../../constants/types';
import { config } from '../../../config';

@injectable()
class MenuController implements Controller {
  db: Sequelize;
  logger: LoggerInterface;
  authSettings: any;

  constructor(
    @inject(types.Database) db: Sequelize,
    @inject(types.Logger) logger: LoggerInterface,
  ) {
    this.db = db;
    this.logger = logger;
    this.authSettings = config.auth;
  }

  get router(): Router {
    const router = Router();

    router.get('/menu', this.get);

    return router;
  }

  private rolesBko = [
    rolesEnum.boAdministrador,
    rolesEnum.boOperacoes,
    rolesEnum.super,
  ];

  get = async (req: Request, res: Response, next: NextFunction) => {
    const promises = [];
    const add = promise => promises.push(promise);

    const menu = {
      bulletCredenciamentoPendente: 0,
      bulletFornecedorPendenteCadastro: 0,
      bulletVinculosPendentes: 0,
      bulletCessoesPendentes: 0,
      bulletEcPendenteCadastro: 0,
    };

    const { user } = req;
    const ehEstabelecimento = user.participanteEstabelecimento;
    const ehFornecedor = user.participanteFornecedor;
    const ehBackoffice = user.resource_access[this.authSettings.clientId].roles
      .some((r: rolesEnum) => this.rolesBko.includes(r));

    if (ehBackoffice) {
      add(
        this.db.entities.credenciamento.count({
          where: { status: credenciamentoStatusEnum.pendente, ativo: true },
        }).then((amount) => {
          menu.bulletCredenciamentoPendente = amount;
        })
      );

      add(
        this.db.entities.participanteIndicacao.count({
          where: {
            canalEntrada: participateNominationSourceEnum.indicacaoPorFornecedor,
            status: participanteVinculoStatus.pendente,
          },
        }).then((amount) => {
          menu.bulletEcPendenteCadastro = amount;
        })
      );

      add(
        this.db.entities.participanteIndicacao.count({
          where: {
            canalEntrada: participateNominationSourceEnum.indicacaoPorEc,
            status: participanteVinculoStatus.pendente,
          },
        }).then((amount) => {
          menu.bulletFornecedorPendenteCadastro = amount;
        })
      );
    }

    if (ehEstabelecimento) {
      add(
        this.db.entities.participanteVinculo.count({
          where: {
            participanteEstabelecimentoId: +user.participante,
            status: participanteVinculoStatus.pendente,
          },
        }).then((amount) => {
          menu.bulletVinculosPendentes = amount;
        })
      );
    }

    if (ehEstabelecimento || ehFornecedor) {
      add(
        this.db.entities.participanteVinculo.findAll({
          attributes: ['id'],
          where: {
            // Investigar o motivo de não aceitar essa sintaxe
            $or: ([
              { participanteEstabelecimentoId: +user.participante },
              { participanteFornecedorId: +user.participante },
            ] as any),
          },
          include: [{
            model: this.db.entities.cessao,
            as: 'cessoes',
            required: true,
            attributes: ['id'],
            where: {
              status: cessaoStatus.aguardandoAprovacao,
              dataExpiracao: { $gt: new Date() },
            },
          }],
        }).then((vinculos) => {
          menu.bulletCessoesPendentes = vinculos
            .reduce((amount, vinculo) => amount + vinculo.cessoes.length, 0);
        })
      );
    }

    return Promise.all(promises)
      .then(() => res.send(menu))
      .catch(next);
  }
}

export default MenuController;
