// tslint:disable: no-magic-numbers
import { Table, AllowNull, Column, DataType, Model, Default, HasMany } from 'sequelize-typescript';
import { CessaoTipoParametro } from './CessaoTipoParametro';

@Table({
  timestamps: true,
  tableName: 'cessaoParametro'
})

export class CessaoParametro extends Model<CessaoParametro>{
  @AllowNull(false)
  @Column(DataType.STRING(20))
  chave: string;

  @AllowNull(true)
  @Column(DataType.STRING(100))
  descricao: string;

  @AllowNull(true)
  @Default(true)
  @Column(DataType.STRING(100))
  valorPadrao: string;

  @HasMany(() => CessaoTipoParametro, 'cessaoParametroId')
  cessaoParametro: CessaoTipoParametro[];
}
