// tslint:disable:no-magic-numbers
import { Table, Model, Column, DataType, AllowNull, Default, Is } from 'sequelize-typescript';
import cessaoTipo from '../../../domain/entities/cessaoTipo';
import cessaoRecebivelStatus from '../../../domain/entities/cessaoRecebivelStatus';
import cessaoDiluicaoPagamento from '../../../domain/entities/cessaoDiluicaoPagamento';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
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
  @Default(cessaoRecebivelStatus.pagamentoPendente)
  @Column(DataType.SMALLINT)
  cessaoStatusId: number;

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
  @Column(DataType.DATE)
  dataRespostaEstabelecimento: Date;

  @AllowNull(true)
  @Column(DataType.STRING(100))
  usuarioRespostaEstabelecimento: string;

  @AllowNull(false)
  @Is('cessaoTipoValidation', cessaoTipoValidation)
  @Column(DataType.INTEGER)
  cessaoTipoId: number;

  @AllowNull(false)
  @Is('cessaoDiluicaoValidation', cessaoDiluicaoValidation)
  @Column(DataType.SMALLINT)
  diluicaoPagamento: number;

  @AllowNull(true)
  @Column(DataType.SMALLINT)
  numeroParcelas: number;
}

function statusRecebivelValidation(value: number[]) {
  const status = Object.values(cessaoRecebivelStatus);

  if (value.some(v => !status.includes(v))) {
    throw new Exceptions.InvalidCessionStatusException();
  }
}

function cessaoTipoValidation(value: number[]) {
  const tipo = Object.values(cessaoTipo);

  if (value.some(v => !tipo.includes(v))) {
    throw new Exceptions.InvalidCessionTypeException();
  }
}

function cessaoDiluicaoValidation(value: number[]) {
  const diluicao = Object.values(cessaoDiluicaoPagamento);

  if (value.some(v => !diluicao.includes(v))) {
    throw new Exceptions.InvalidCessionPaymentException();
  }
}
