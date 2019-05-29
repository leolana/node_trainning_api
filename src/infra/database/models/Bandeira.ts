// tslint:disable:no-magic-numbers
import { Table, Model, Column, DataType, AllowNull, Default } from 'sequelize-typescript';

@Table({
  timestamps: true,
  tableName: 'bandeira'
})

export class Bandeira extends Model<Bandeira> {
  @AllowNull(false)
  @Column(DataType.STRING(100))
  nome: string;

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  ativo: boolean;

}
