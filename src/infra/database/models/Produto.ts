// tslint:disable: no-magic-numbers
import { Table, AllowNull, Column, DataType, Model, Default } from 'sequelize-typescript';

@Table({
  timestamps: true,
  tableName: 'produto'
})

export class Produto extends Model<Produto>{
  @AllowNull(true)
  @Column(DataType.STRING(100))
  nome: string;

  @AllowNull(true)
  @Default(true)
  @Column(DataType.BOOLEAN)
  ativo: boolean;
}
