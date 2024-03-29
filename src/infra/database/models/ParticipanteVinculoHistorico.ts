
// tslint:disable:no-magic-numbers
import { Table, Model, Column, DataType, AllowNull, Default, Is } from 'sequelize-typescript';
import participanteVinculoStatus from '../../../domain/entities/participanteVinculoStatus';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
@Table({
  timestamps: true,
  tableName: 'participanteVinculoHistorico'
})

export class ParticipanteVinculoHistorico extends Model<ParticipanteVinculoHistorico> {
  @AllowNull(false)
  @Column(DataType.INTEGER)
  participanteVinculoId: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  participanteEstabelecimentoId: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  participanteFornecedorId: number;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  usuario: string;

  @Is('statusValidation', statusValidation)
  @AllowNull(false)
  @Default(participanteVinculoStatus.pendente)
  @Column(DataType.SMALLINT)
  status: number;

  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  exibeValorDisponivel: boolean;

  @AllowNull(false)
  @Column(DataType.SMALLINT)
  diasAprovacao: number;

  @AllowNull(true)
  @Column(DataType.DATE)
  dataRespostaEstabelecimento: Date;

  @AllowNull(true)
  @Column(DataType.STRING(100))
  usuarioRespostaEstabelecimento: string;

  @AllowNull(true)
  @Column(DataType.FLOAT)
  valorMaximoExibicao: number;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  motivoTipoRecusaId: number;

  @AllowNull(true)
  @Column(DataType.STRING(500))
  motivoRecusaObservacao: string;

  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  estabelecimentoSolicitouVinculo: boolean;

}

function statusValidation(value: number[]) {
  const status = Object.values(participanteVinculoStatus);

  if (value.some(v => !status.includes(v))) {
    throw new Exceptions.InvalidBoundStatusException();
  }
}
