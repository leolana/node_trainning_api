// tslint:disable:no-magic-numbers
import { Table, Model, Column, DataType, AllowNull,  Is, HasMany, BelongsTo } from 'sequelize-typescript';
import recusaTipoEnum from '../../../domain/entities/recusaTipoEnum';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import { MotivoRecusa } from './MotivoRecusa';
import { ParticipanteIndicacao } from './ParticipanteIndicacao';
import { ParticipanteVinculo } from './ParticipanteVinculo';

@Table({
  timestamps: true,
  tableName: 'motivoTipoRecusa'
})

export class MotivoTipoRecusa extends Model<MotivoTipoRecusa> {
  @AllowNull(false)
  @Column(DataType.INTEGER)
  motivoRecusaId: number;

  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  @Is('typeRejectionValidation', typeRejectionValidation)
  recusaTipoId: number;

  @HasMany(() => ParticipanteIndicacao, 'motivoTipoRecusaId')
  motivosTipoRecusa: ParticipanteIndicacao[];

  @HasMany(() => ParticipanteVinculo, 'motivoTipoRecusaId')
  participanteVinculos: ParticipanteVinculo[];

  @BelongsTo(() => MotivoRecusa, 'motivoRecusaId')
  motivoRecusa: MotivoRecusa[];
}

function typeRejectionValidation(value: number[]) {
  const type = Object.values(recusaTipoEnum);

  if (value.some(v => !type.includes(v))) {
    throw new Exceptions.InvalidRejectionTypeException();
  }
}
