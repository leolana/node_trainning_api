// tslint:disable: no-magic-numbers
import { Table, AllowNull, Column, DataType, Model } from 'sequelize-typescript';

@Table({
  timestamps: true,
  tableName: 'participanteTaxaHistorico'
})

export class ParticipanteTaxaHistorico extends Model<ParticipanteTaxaHistorico>{
  @AllowNull(false)
  @Column(DataType.INTEGER)
  participanteTaxaId: number;

  @AllowNull(true)
  @Column(DataType.DECIMAL)
  valorInicio: number;

  @AllowNull(true)
  @Column(DataType.DECIMAL)
  valorFIm: number;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  taxa: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  participanteId: number;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  usuarioCriacao: string;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  participanteTaxaTipo: number;

  @AllowNull(false)
  @Column(DataType.DATE)
  dataInclusao: Date;
}
