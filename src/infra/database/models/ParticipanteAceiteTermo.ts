// tslint:disable:no-magic-numbers
import { Table, Model, Column, DataType, AllowNull, BelongsTo } from 'sequelize-typescript';
import { Participante } from './Participante';
import { Termo } from './Termo';

@Table({
  timestamps: true,
  tableName: 'participanteAceiteTermo'
})

export class ParticipanteAceiteTermo extends Model<ParticipanteAceiteTermo> {
  @AllowNull(false)
  @Column(DataType.INTEGER)
  participanteId: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  termoId: number;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  usuario: string;

  @BelongsTo(() => Termo, 'termoId')
  termo: Termo[];

  @BelongsTo(() => Participante, 'participanteId')
  participante: Participante[];
}
