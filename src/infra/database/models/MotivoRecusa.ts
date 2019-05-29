// tslint:disable:no-magic-numbers
import { Table, Model, Column, DataType, AllowNull, Default, HasMany } from 'sequelize-typescript';
import { MotivoTipoRecusa } from './MotivoTipoRecusa';

@Table({
  timestamps: true,
  tableName: 'motivoRecusa'
})

export class MotivoRecusa extends Model<MotivoRecusa> {
  @AllowNull(true)
  @Column(DataType.STRING(20))
  codigo: string;

  @AllowNull(true)
  @Column(DataType.STRING(100))
  descricao: string;

  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  requerObservacao: boolean;

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  ativo: boolean;

  @HasMany(() => MotivoTipoRecusa, 'motivoRecusaId')
  tiposRecusa: MotivoTipoRecusa[];

}
