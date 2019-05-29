// tslint:disable:no-magic-numbers
import { Table, Model, Column, DataType, AllowNull, Default, Is } from 'sequelize-typescript';
import participanteVinculoStatus from '../../../domain/entities/participanteVinculoStatus';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
@Table({
  timestamps: true,
  tableName: 'participanteVinculoRecorrente'
})

export class ParticipanteVinculoRecorrente extends Model<ParticipanteVinculoRecorrente> {
  @AllowNull(false)
  @Column(DataType.INTEGER)
  participanteVinculoId: number;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  usuario: string;

  @Is('statusValidation', statusValidation)
  @AllowNull(false)
  @Default(participanteVinculoStatus.pendente)
  @Column(DataType.SMALLINT)
  status: number;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  valorMaximo: number;

  @AllowNull(false)
  @Column(DataType.DATEONLY)
  dataFinalVigencia: Date;

  @AllowNull(true)
  @Column(DataType.STRING(100))
  usuarioAprovadorEstabelecimento: string;

  @AllowNull(true)
  @Column(DataType.DATE)
  dataAprovacaoEstabelecimento: Date;
}

function statusValidation(value: number[]) {
  const status = Object.values(participanteVinculoStatus);

  if (value.some(v => !status.includes(v))) {
    throw new Exceptions.InvalidBoundStatusException();
  }
}
