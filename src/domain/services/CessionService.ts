import { injectable, inject } from 'inversify';

import * as cessionService from './cessao';
import { Sequelize } from 'sequelize-typescript';
import { SiscofWrapper } from '../../infra/siscof';
import { Mailer } from '../../infra/mailer';
import { Environment } from '../../infra/environment/Environment';

import types from '../../constants/types';
import { LoggerInterface } from '../../infra/logging';

@injectable()
class CessionService {
  private db: Sequelize;
  private logger: LoggerInterface;
  private siscofWrapper: SiscofWrapper;
  private mailer: Mailer;
  private emailTemplates: any;
  private mailerSettings: any;

  constructor(
    @inject(types.Database) db: Sequelize,
    @inject(types.SiscofWrapper) siscofWrapper: SiscofWrapper,
    @inject(types.Environment) config: Environment,
    @inject(types.MailerFactory) mailer: () => Mailer,
    @inject(types.Logger) logger: LoggerInterface,
  ) {
    this.db = db;
    this.siscofWrapper = siscofWrapper;
    this.mailer = mailer();
    this.logger = logger;
    this.emailTemplates = this.mailer.emailTemplates;
    this.mailerSettings = config.mailer;
  }

  validaCessao = cessionService.validate;
  resolverCessao = (aprovado, cessao, termoId, recorrencia, user) => {
    return cessionService.resolve(this.db, this.siscofWrapper)(aprovado, cessao, termoId, recorrencia, user);
  }
  notificarCessao = () => cessionService.notificate(
    this.mailer,
    this.emailTemplates,
    this.mailerSettings,
    this.logger
  )

  aprovarReprovarCessao = (aprovado, participanteId, cessaoId, termoId, user) => {
    return cessionService.approveDisapprove(
      this.db,
      this.siscofWrapper,
      this.mailer,
      this.emailTemplates,
      this.mailerSettings,
      this.logger
    )(aprovado, participanteId, cessaoId, termoId, user);
  }

  verificaRecorrencia = (vinculo) => {
    return cessionService.checkRecurrence(this.db)(vinculo);
  }

  verificaRecorrenciaPorId = (vinculo, vinculoId, fornecedorId = null) => {
    return cessionService.checkRecurrenceById(this.db)(vinculo, vinculoId, fornecedorId);
  }

  verificaRecorrenciaPorIdVinculo = (vinculoId) => {
    const action = this.verificaRecorrenciaPorId('vinculo', vinculoId);
    return action;
  }

  verificaRecorrenciaPorIdParticipantes = (
    estabelecimentoId,
    fornecedorId,
  ) => {
    return this.verificaRecorrenciaPorId(
      'participantes',
      estabelecimentoId,
      fornecedorId,
    );
  }

  validaCessaoRecorrente = (
    valor,
    dataVencimento,
    valorMaximo,
    dataFinalVigencia,
    user,
    vinculo
  ) => {
    return cessionService.validateRecurrence(this.db)(
      valor,
      dataVencimento,
      valorMaximo,
      dataFinalVigencia,
      user,
      vinculo
    );
  }
}

export default CessionService;
