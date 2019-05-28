// tslint:disable:no-magic-numbers
import { Table, Model, Column, DataType, AllowNull, Default, HasMany, Is } from 'sequelize-typescript';
import tiposPessoa from '../../../domain/entities/tiposPessoa';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import { ParticipanteIndicacao } from './ParticipanteIndicacao';

@Table({
  timestamps: true,
  tableName: 'participante'
})

export class Participante extends Model<Participante> {
  @AllowNull(false)
  @Is('typePersonValidation', typePersonValidation)
  @Column(DataType.SMALLINT)
  tipoPessoa: number;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  ramoAtividadeCodigo: number;

  @AllowNull(false)
  @Column(DataType.STRING(18))
  documento: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  nome: string;

  @AllowNull(true)
  @Column(DataType.DATEONLY)
  aberturaNascimento: Date;

  @AllowNull(false)
  @Column(DataType.STRING(11))
  telefone: string;

  @AllowNull(false)
  @Column(DataType.STRING(8))
  cep: string;

  @AllowNull(false)
  @Column(DataType.STRING(200))
  logradouro: string;

  @AllowNull(false)
  @Column(DataType.STRING(15))
  numero: string;

  @Column(DataType.STRING(50))
  complemento: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  bairro: string;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  cidadeId: number;

  @Column(DataType.STRING(100))
  razaoSocial: string;

  @Column(DataType.STRING(15))
  inscricaoEstadual: string;

  @Column(DataType.STRING(15))
  inscricaoMunicipal: string;

  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  @Default(true)
  ativo: boolean;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  usuario: string;

  @Column(DataType.JSONB)
  arquivos: string;

  @HasMany(() => ParticipanteIndicacao, 'participanteId')
  indicacoes: ParticipanteIndicacao[];

}

function typePersonValidation(value: number[]) {
  const type = Object.values(tiposPessoa);

  if (value.some(v => !type.includes(v))) {
    throw new Exceptions.InvalidPersonTypeException();
  }
}
