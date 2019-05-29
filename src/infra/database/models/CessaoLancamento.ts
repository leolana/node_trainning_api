// tslint:disable: no-magic-numbers
import { Table, AllowNull, Column, DataType, Model, BelongsTo, Default } from 'sequelize-typescript';
import { Cessao } from './Cessao';
import { CessaoLancamentoStatus } from './CessaoLancamentoStatus';
import { CessaoLancamentoTipo } from './CessaoLancamentoTipo';
import { Participante } from '..';

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
  @Default(1)
  @Column(DataType.SMALLINT)
  cessaoLancamentoStatusId: number;

  @AllowNull(false)
  @Column(DataType.DECIMAL)
  valor: number;

  @AllowNull(false)
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

  @BelongsTo(() => Participante, 'participanteId')
  participantes: Participante[];
}
