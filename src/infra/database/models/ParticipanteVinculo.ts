
// tslint:disable:no-magic-numbers
import { Table, Model, Column, DataType, AllowNull, Default, Is, HasMany, BelongsTo } from 'sequelize-typescript';
import participanteVinculoStatus from '../../../domain/entities/participanteVinculoStatus';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import { Cessao } from './Cessao';
import { MotivoTipoRecusa } from './MotivoTipoRecusa';
import { ParticipanteVinculoRecorrente } from './ParticipanteVinculoRecorrente';
@Table({
  timestamps: true,
  tableName: 'participanteVinculo'
})

export class ParticipanteVinculo extends Model<ParticipanteVinculo> {
  @AllowNull(false)
  @Column(DataType.INTEGER)
  participanteEstabelecimentoId: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  participanteFornecedorId: number;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  usuario: string;

  @Is('statusValidation', statusValidation)
  @AllowNull(false)
  @Column(DataType.SMALLINT)
  @Default(participanteVinculoStatus.pendente)
  status: number;

  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  exibeValorDisponivel: boolean;

  @AllowNull(false)
  @Column(DataType.SMALLINT)
  diasAprovacao: number;

  @AllowNull(true)
  @Column(DataType.DATE)
  dataRespostaEstabelecimento: Date;

  @AllowNull(true)
  @Column(DataType.STRING(100))
  usuarioRespostaEstabelecimento: string;

  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  estabelecimentoSolicitouVinculo: boolean;

  @AllowNull(true)
  @Column(DataType.FLOAT)
  valorMaximoExibicao: number;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  motivoTipoRecusaId: number;

  @AllowNull(true)
  @Column(DataType.STRING(500))
  motivoRecusaObservacao: string;

  @HasMany(() => Cessao, 'participanteVinculoId')
  cessoes: Cessao[];
  @HasMany(() => ParticipanteVinculoRecorrente, 'participanteVinculoId')
  recorrentes: ParticipanteVinculoRecorrente[];

  @BelongsTo(() => MotivoTipoRecusa, 'motivoTipoRecusaId')
  recusa: MotivoTipoRecusa[];
}

function statusValidation(value: number[]) {
  const status = Object.values(participanteVinculoStatus);

  if (value.some(v => !status.includes(v))) {
    throw new Exceptions.InvalidBoundStatusException();
  }
}
