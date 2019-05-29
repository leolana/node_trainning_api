// tslint:disable: no-magic-numbers
import { Table, AllowNull, Column, DataType, Model } from 'sequelize-typescript';

@Table({
  timestamps: true,
  tableName: 'transacaoHistorico'
})

export class TransacaoHistorico extends Model<TransacaoHistorico>{
  @AllowNull(false)
  @Column(DataType.INTEGER)
  transacaoId: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  participanteId: boolean;
}
