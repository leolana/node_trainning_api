// tslint:disable:no-magic-numbers
import { Table, Model, Column, DataType, AllowNull, Default, Is, BelongsTo } from 'sequelize-typescript';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';

import participanteIndicacaoStatus from '../../../domain/entities/participanteIndicacaoStatus';
import participateNominationSourceEnum from '../../../domain/entities/participateNominationSourceEnum';
import personTypeEnum from '../../../domain/services/types/personTypeEnum';
import { Participante } from './Participante';
import { MotivoTipoRecusa } from './MotivoTipoRecusa';

@Table({
  timestamps: true,
  tableName: 'participanteIndicacao'
})

export class ParticipanteIndicacao extends Model<ParticipanteIndicacao> {
  @AllowNull(false)
  @Column(DataType.INTEGER)
  participanteId: number;

  @AllowNull(false)
  @Column(DataType.STRING(18))
  documento: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  usuario: string;

  @AllowNull(false)
  @Default(participanteIndicacaoStatus.pendente)
  @Is('indicacaoStatusValidaiton', indicacaoStatusValidaiton)
  @Column(DataType.SMALLINT)
  status: number;

  @AllowNull(true)
  @Column(DataType.STRING(100))
  usuarioResposta: string;

  @AllowNull(true)
  @Column(DataType.STRING(500))
  motivo: string;

  @AllowNull(false)
  @Is('typePersonValidation', typePersonValidation)
  @Column(DataType.INTEGER)
  tipoPessoa: number;

  @AllowNull(true)
  @Column(DataType.STRING(100))
  nome: string;

  @AllowNull(true)
  @Column(DataType.STRING(100))
  email: string;

  @AllowNull(true)
  @Column(DataType.STRING(11))
  telefone: string;

  @AllowNull(false)
  @Is('participantNominationValidation', participantNominationValidation)
  @Column(DataType.INTEGER)
  canalEntrada: number;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  motivoTipoRecusaId: number;

  @AllowNull(true)
  @Column(DataType.DATE)
  dataFimIndicacao: Date;

  @BelongsTo(() => Participante, 'participanteId')
  participante: Participante[];

  @BelongsTo(() => MotivoTipoRecusa, 'motivoTipoRecusaId')
  motivoTipoRecusa: MotivoTipoRecusa[];

}

function typePersonValidation(value: number[]) {
  const type = Object.values(personTypeEnum);

  if (value.some(v => !type.includes(v))) {
    throw new Exceptions.InvalidPersonTypeException();
  }
}

function participantNominationValidation(value: number[]) {
  const participantNomination = Object.values(participateNominationSourceEnum);

  if (value.some(v => !participantNomination.includes(v))) {
    throw new Exceptions.InvalidPersonTypeException();
  }
}

function indicacaoStatusValidaiton(value: number[]) {
  const participanteIndicacao = Object.values(participanteIndicacaoStatus);

  if (value.some(v => !participanteIndicacao.includes(v))) {
    throw new Exceptions.InvalidStatusNominationException();
  }
}
