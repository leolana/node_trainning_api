// tslint:disable: no-magic-numbers
import { Table, AllowNull, Column, DataType, Model, BelongsTo } from 'sequelize-typescript';
import { Cessao } from './Cessao';
import { CessaoLancamentoStatus } from './CessaoLancamentoStatus';
import { CessaoLancamentoTipo } from './CessaoLancamentoTipo';

@Table({
  timestamps: true,
  tableName: 'cessaoLancamento'
})

export class CessaoLancamento extends Model<CessaoLancamento>{
  @AllowNull(false)
  @Column(DataType.INTEGER)
  cessaoId: number;

  @AllowNull(false)
  @Column(DataType.SMALLINT)
  lancamentoTipoId: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  participanteId: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  cessaoLancamentoStatusId: number;

  @AllowNull(false)
  @Column(DataType.DECIMAL)
  valor: number;

  @AllowNull(true)
  @Column(DataType.DATEONLY)
  data: Date;

  @AllowNull(true)
  @Column(DataType.STRING(100))
  chaveDestino: string;

  @AllowNull(true)
  @Column(DataType.STRING(100))
  descricao: string;

  @BelongsTo(() => CessaoLancamentoStatus, 'cessaoLancamentoStatusId')
  lancamentoStatus: CessaoLancamentoStatus[];

  @BelongsTo(() => CessaoLancamentoTipo, 'lancamentoTipoId')
  lancamentotipo: CessaoLancamentoTipo[];

  @BelongsTo(() => Cessao, 'cessaoId')
  cessoes: Cessao[];

}
