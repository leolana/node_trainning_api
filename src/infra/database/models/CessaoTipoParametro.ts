// tslint:disable: no-magic-numbers
import { Table, AllowNull, Column, DataType, Model, BelongsTo } from 'sequelize-typescript';
import { CessaoParametro } from './CessaoParametro';
import { CessaoTipo } from './CessaoTipo';

@Table({
  timestamps: true,
  tableName: 'cessaoTipoParametro'
})

export class CessaoTipoParametro extends Model<CessaoTipoParametro>{
  @AllowNull(false)
  @Column(DataType.INTEGER)
  cessaoTipoId: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  cessaoParametroId: number;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  valor: string;

  @BelongsTo(() => CessaoParametro, 'cessaoParametroId')
  cessaoParametro: CessaoParametro[];

  @BelongsTo(() => CessaoTipo, 'cessaoTipoId')
  cessaoTipo: CessaoTipo[];
}
