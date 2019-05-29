// tslint:disable: no-magic-numbers
import { Table, AllowNull, Column, DataType, Model, Default } from 'sequelize-typescript';

@Table({
  timestamps: true,
  tableName: 'adquirente'
})

export class Adquirente extends Model<Adquirente>{
  @AllowNull(true)
  @Column(DataType.STRING(100))
  nome: string;

  @AllowNull(true)
  @Default(true)
  @Column(DataType.BOOLEAN)
  ativo: boolean;
}
