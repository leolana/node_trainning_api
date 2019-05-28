// tslint:disable:no-magic-numbers
import { Table, Model, Column, DataType, AllowNull, Default, Is, BelongsTo } from 'sequelize-typescript';
import cessaoRecebivelStatus from '../../../domain/entities/cessaoRecebivelStatus';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import { Cessao } from './Cessao';
@Table({
  timestamps: true,
  tableName: 'cessaoHistorico'
})

export class CessaoHistorico extends Model<CessaoHistorico> {
  @AllowNull(false)
  @Column(DataType.INTEGER)
  cessaoId: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  participanteVinculoId: number;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  solicitante: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  usuario: string;

  @Is('statusRecebivelValidation', statusRecebivelValidation)
  @AllowNull(false)
  @Column(DataType.SMALLINT)
  @Default(cessaoRecebivelStatus.pagamentoPendente)
  status: number;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  valorSolicitado: number;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  valorDisponivel: number;

  @AllowNull(false)
  @Column(DataType.DATEONLY)
  dataVencimento: Date;

  @AllowNull(false)
  @Column(DataType.DATEONLY)
  dataExpiracao: Date;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  codigoCessao: number;

  @AllowNull(true)
  @Column(DataType.STRING(30))
  referencia: string;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  codigoRetornoSiscof: number;

  @AllowNull(true)
  @Column(DataType.STRING(500))
  mensagemRetornoSiscof: string;

  @AllowNull(true)
  @Column(DataType.FLOAT)
  taxaCessao: number;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  fornecedorAceiteTermoId: number;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  estabelecimentoAceiteTermoId: number;

  @AllowNull(true)
  @Column(DataType.DATE)
  dataRespostaEstabelecimento: Date;

  @AllowNull(true)
  @Column(DataType.STRING(100))
  usuarioRespostaEstabelecimento: string;

  @AllowNull(true)
  @Column(DataType.SMALLINT)
  numeroParcelas: number;

  @BelongsTo(() => Cessao, 'cessaoId')
  cessao: Cessao[];
}

function statusRecebivelValidation(value: number[]) {
  const status = Object.values(cessaoRecebivelStatus);

  if (value.some(v => !status.includes(v))) {
    throw new Exceptions.InvalidCessionStatusException();
  }
}
