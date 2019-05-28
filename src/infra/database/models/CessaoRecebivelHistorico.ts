
// tslint:disable:no-magic-numbers
import { Table, Model, Column, DataType, AllowNull, Default, Is } from 'sequelize-typescript';
import cessaoRecebivelStatus from '../../../domain/entities/cessaoRecebivelStatus';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
@Table({
  timestamps: true,
  tableName: 'cessaoRecebivelHistorico'
})

export class CessaoRecebivelHistorico extends Model<CessaoRecebivelHistorico> {
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
}

function statusPagamentoValidation(value: number[]) {
  const status = Object.values(cessaoRecebivelStatus);

  if (value.some(v => !status.includes(v))) {
    throw new Exceptions.InvalidCessionStatusException();
  }
}
