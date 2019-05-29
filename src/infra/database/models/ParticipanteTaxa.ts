// tslint:disable: no-magic-numbers
import { Table, AllowNull, Column, DataType, Model, BelongsTo, Is } from 'sequelize-typescript';
import { Participante } from '..';
import rateTypeEnum from '../../../domain/services/types/rateTypeEnum';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';

@Table({
  timestamps: true,
  tableName: 'participanteTaxa'
})

export class ParticipanteTaxa extends Model<ParticipanteTaxa>{
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
  @Is('taxaTipo', taxaTipoValidation)
  @Column(DataType.INTEGER)
  participanteTaxaTipo: number;

  @BelongsTo(() => Participante, 'participanteId')
  participante: Participante[];
}
function taxaTipoValidation(value: number[]) {
  const taxa = Object.values(rateTypeEnum);

  if (value.some(v => !taxa.includes(v))) {
    throw new Exceptions.InvalidRateTypeException();
  }
}