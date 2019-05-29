
// tslint:disable:no-magic-numbers
import { Table, Model, Column, DataType, AllowNull, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Adquirente } from './Adquirente';
import { Bandeira, Participante } from '..';
import { Produto } from './Produto';
import { TipoAgenda } from './TipoAgenda';
@Table({
  timestamps: true,
  tableName: 'transacao'
})

export class Transacao extends Model<Transacao> {
  @AllowNull(false)
  @Column(DataType.DATEONLY)
  dataVenda: Date;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  valorVenda: number;

  @AllowNull(false)
  @Column(DataType.DATEONLY)
  dataPagar: Date;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  valorPagar: number;

  @AllowNull(false)
  @Column(DataType.STRING(30))
  nsu: string;

  @AllowNull(false)
  @Column(DataType.SMALLINT)
  numeroParcelas: number;

  @AllowNull(false)
  @Column(DataType.SMALLINT)
  totalParcelas: number;

  @AllowNull(true)
  @Column(DataType.STRING(30))
  autorizacao: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  chaveOrigem: string;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  participanteId: number;

  @AllowNull(false)
  @ForeignKey(() => Participante)
  @Column(DataType.INTEGER)
  participanteOriginal: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  produtoId: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  adquirenteId: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  bandeiraId: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  tipoAgendaId: number;

  @BelongsTo(() => Adquirente, 'adquirenteId')
  adquirentes: Adquirente[];

  @BelongsTo(() => Bandeira, 'bandeiraId')
  bandeiras: Bandeira[];

  @BelongsTo(() => Participante, 'participanteId')
  participantes: Participante[];

  @BelongsTo(() => Produto, 'produtoId')
  produtos: Produto[];

  @BelongsTo(() => TipoAgenda, 'tipoAgendaId')
  tipoAgenda: TipoAgenda[];
}
