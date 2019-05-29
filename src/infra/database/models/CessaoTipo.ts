// tslint:disable: no-magic-numbers
import { Table, AllowNull, Column, DataType, Model, Default, HasMany } from 'sequelize-typescript';
import { CessaoTipoParametro } from './CessaoTipoParametro';

@Table({
  timestamps: true,
  tableName: 'cessaoTipo'
})

export class CessaoTipo extends Model<CessaoTipo>{
  @AllowNull(true)
  @Column(DataType.STRING(100))
  nome: string;

  @AllowNull(true)
  @Default(true)
  @Column(DataType.BOOLEAN)
  ativo: boolean;

  @HasMany(() => CessaoTipoParametro, 'cessaoTipoId')
  cessaoTipo: CessaoTipoParametro[];
}
