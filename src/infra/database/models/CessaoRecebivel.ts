
// tslint:disable:no-magic-numbers
import { Table, Model, Column, DataType, AllowNull, Default, Is, BelongsTo } from 'sequelize-typescript';
import cessaoRecebivelStatus from '../../../domain/entities/cessaoRecebivelStatus';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import { Evento } from './Evento';
@Table({
  timestamps: true,
  tableName: 'cessaoRecebivel'
})

export class CessaoRecebivel extends Model<CessaoRecebivel> {
  @AllowNull(false)
  @Column(DataType.INTEGER)
  cessaoId: number;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  eventoId: number;

  @AllowNull(true)
  @Column(DataType.DATEONLY)
  dataVenda: Date;

  @AllowNull(true)
  @Column(DataType.FLOAT)
  valorVenda: number;

  @AllowNull(true)
  @Column(DataType.DATEONLY)
  dataReserva: Date;

  @AllowNull(true)
  @Column(DataType.DATEONLY)
  dataPagarEc: Date;

  @AllowNull(true)
  @Column(DataType.FLOAT)
  valorPagarEc: number;

  @AllowNull(true)
  @Column(DataType.STRING(30))
  nsu: string;

  @AllowNull(true)
  @Column(DataType.SMALLINT)
  numeroParcelas: number;

  @AllowNull(true)
  @Column(DataType.SMALLINT)
  totalParcelas: number;

  @Is('statusPagamentoValidation', statusPagamentoValidation)
  @AllowNull(true)
  @Column(DataType.SMALLINT)
  @Default(cessaoRecebivelStatus.pagamentoPendente)
  statusPagamento: number;

  @BelongsTo(() => Evento, 'eventoId')
  evento: Evento[];
}

function statusPagamentoValidation(value: number[]) {
  const status = Object.values(cessaoRecebivelStatus);

  if (value.some(v => !status.includes(v))) {
    throw new Exceptions.InvalidCessionStatusException();
  }
}
