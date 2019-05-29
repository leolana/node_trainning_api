// tslint:disable:no-magic-numbers
import { Table, Model, Column, DataType, AllowNull, Is, } from 'sequelize-typescript';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import termoTipo from '../../../domain/entities/termoTipo';
@Table({
  timestamps: true,
  tableName: 'termo'
})

export class Termo extends Model<Termo> {
  @AllowNull(false)
  @Column(DataType.STRING(100))
  titulo: string;

  @Is('tipoValidation', tipoValidation)
  @AllowNull(false)
  @Column(DataType.SMALLINT)
  tipo: number;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  usuario: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  texto: string;

  @AllowNull(false)
  @Column(DataType.DATEONLY)
  inicio: Date;

  @AllowNull(true)
  @Column(DataType.DATEONLY)
  fim: Date;
}

function tipoValidation(value: number[]) {
  const type = Object.values(termoTipo);

  if (value.some(v => !type.includes(v))) {
    throw new Exceptions.InvalidTermException();
  }
}
