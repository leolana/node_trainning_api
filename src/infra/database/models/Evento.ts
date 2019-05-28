// tslint:disable:no-magic-numbers
import { Table, Model, Column, DataType, AllowNull } from 'sequelize-typescript';

@Table({
  timestamps: true,
  tableName: 'evento'
})

export class Evento extends Model<Evento> {
  @AllowNull(false)
  @Column(DataType.STRING(100))
  nome: string;
}
