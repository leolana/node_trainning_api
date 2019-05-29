// tslint:disable:no-magic-numbers
import { Table, Model, Column, DataType, AllowNull, Default, Is, HasMany, BelongsTo } from 'sequelize-typescript';
import cessaoStatus from '../../../domain/entities/cessaoStatus';
import cessaoTipo from '../../../domain/entities/cessaoTipo';
import cessaoDiluicaoPagamento from '../../../domain/entities/cessaoDiluicaoPagamento';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import { CessaoAceite } from './CessaoAceite';
import { CessaoRecebivel } from './CessaoRecebivel';
import { CessaoStatus } from './CessaoStatus';
import { ParticipanteVinculo } from '..';
import { CessaoTipo } from './CessaoTipo';
@Table({
  timestamps: true,
  tableName: 'cessao'
})

export class Cessao extends Model<Cessao> {
  @AllowNull(false)
  @Column(DataType.INTEGER)
  participanteVinculoId: number;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  solicitante: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  usuario: string;

  @Is('statusValidation', statusValidation)
  @AllowNull(false)
  @Default(cessaoStatus.aguardandoAprovacao)
  @Column(DataType.SMALLINT)
  cessaoStatusId: number;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  valorSolicitado: number;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  valorDisponivel: number;

  @AllowNull(false)
  @Column(DataType.DATEONLY)
  dataVencimento: Date;

  @AllowNull(false)
  @Column(DataType.DATEONLY)
  dataExpiracao: Date;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  codigoCessao: number;

  @AllowNull(true)
  @Column(DataType.STRING(30))
  referencia: string;

  @AllowNull(true)
  @Column(DataType.DATE)
  dataRespostaEstabelecimento: Date;

  @AllowNull(true)
  @Column(DataType.STRING(100))
  usuarioRespostaEstabelecimento: string;

  @AllowNull(true)
  @Column(DataType.SMALLINT)
  numeroParcelas: number;

  @AllowNull(false)
  @Is('cessaoTipoValidation', cessaoTipoValidation)
  @Default(cessaoTipo.cessao)
  @Column(DataType.INTEGER)
  cessaoTipoId: number;

  @AllowNull(false)
  @Is('cessaoDiluicaoValidation', cessaoDiluicaoValidation)
  @Default(cessaoDiluicaoPagamento.diaVencimento)
  @Column(DataType.SMALLINT)
  diluicaoPagamento: number;

  @HasMany(() => CessaoAceite, 'cessaoId')
  aceites: CessaoAceite[];

  @HasMany(() => CessaoRecebivel, 'cessaoId')
  recebiveis: CessaoRecebivel[];

  @BelongsTo(() => CessaoStatus, 'cessaoStatusId')
  status: CessaoStatus[];

  @BelongsTo(() => CessaoTipo, 'cessaoTipoId')
  tipos: CessaoTipo[];

  @BelongsTo(() => ParticipanteVinculo, 'participanteVinculoId')
  vinculos: ParticipanteVinculo[];

}

function statusValidation(value: number[]) {
  const status = Object.values(cessaoStatus);

  if (value.some(v => !status.includes(v))) {
    throw new Exceptions.InvalidCessionStatusException();
  }
}

function cessaoTipoValidation(value: number[]) {
  const tipo = Object.values(cessaoTipo);

  if (value.some(v => !tipo.includes(v))) {
    throw new Exceptions.InvalidCessionTypeException();
  }
}

function cessaoDiluicaoValidation(value: number[]) {
  const diluicao = Object.values(cessaoDiluicaoPagamento);

  if (value.some(v => !diluicao.includes(v))) {
    throw new Exceptions.InvalidCessionPaymentException();
  }
}
