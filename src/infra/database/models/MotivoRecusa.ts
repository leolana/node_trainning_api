// tslint:disable:no-magic-numbers
import { Table, Model, Column, DataType, AllowNull, Default, HasMany } from 'sequelize-typescript';
import { MotivoTipoRecusa } from './MotivoTipoRecusa';

@Table({
  timestamps: true,
  tableName: 'motivoRecusa'
})

export class MotivoRecusa extends Model<MotivoRecusa> {
  @Column(DataType.STRING(20))
  codigo: string;

  @Column(DataType.STRING(100))
  descricao: string;

  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  requerObservacao: boolean;

  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  @Default(true)
  ativo: boolean;

  @HasMany(() => MotivoTipoRecusa, 'motivoRecusaId')
  tiposRecusa: MotivoTipoRecusa[];

}
