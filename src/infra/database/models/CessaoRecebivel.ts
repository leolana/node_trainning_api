
// tslint:disable:no-magic-numbers
import { Table, Model, Column, DataType, AllowNull, Default, } from 'sequelize-typescript';
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
  transacaoId: number;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  cancelado: boolean;
}
