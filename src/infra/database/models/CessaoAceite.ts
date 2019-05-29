// tslint:disable:no-magic-numbers
import { Table, Model, Column, DataType, AllowNull, Default, Is, BelongsTo } from 'sequelize-typescript';
import cessaoStatus from '../../../domain/entities/cessaoStatus';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import { Termo } from './Termo';
@Table({
  timestamps: true,
  tableName: 'cessaoAceite'
})

export class CessaoAceite extends Model<CessaoAceite> {
  @AllowNull(false)
  @Column(DataType.INTEGER)
  cessaoId: number;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  usuario: string;

  @Is('statusValidation', statusValidation)
  @AllowNull(false)
  @Default(cessaoStatus.aguardandoAprovacao)
  @Column(DataType.SMALLINT)
  status: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  termoId: number;

  @BelongsTo(() => Termo, 'termoId')
  termo: Termo[];

}

function statusValidation(value: number[]) {
  const status = Object.values(cessaoStatus);

  if (value.some(v => !status.includes(v))) {
    throw new Exceptions.InvalidCessionStatusException();
  }
}
