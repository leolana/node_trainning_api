// tslint:disable:no-magic-numbers
import { Table, Model, Column, DataType, AllowNull, Default, HasMany, Is } from 'sequelize-typescript';
import tiposPessoa from '../../../domain/entities/tiposPessoa';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import { ParticipanteIndicacao } from './ParticipanteIndicacao';
import { ParticipanteTaxa } from './ParticipanteTaxa';
import { Transacao } from './Transacao';

@Table({
  timestamps: true,
  tableName: 'participante'
})

export class Participante extends Model<Participante> {
  @AllowNull(false)
  @Is('typePersonValidation', typePersonValidation)
  @Column(DataType.SMALLINT)
  tipoPessoa: number;

  @AllowNull(false)
  @Column(DataType.STRING(18))
  documento: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  nome: string;

  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  @Default(true)
  ativo: boolean;

  @HasMany(() => ParticipanteIndicacao, 'participanteId')
  indicacoes: ParticipanteIndicacao[];

  @HasMany(() => ParticipanteTaxa, 'participanteId')
  taxas: ParticipanteTaxa[];

  @HasMany(() => Transacao, 'participanteId')
  transacao: Transacao[];
}

function typePersonValidation(value: number[]) {
  const type = Object.values(tiposPessoa);

  if (value.some(v => !type.includes(v))) {
    throw new Exceptions.InvalidPersonTypeException();
  }
}
