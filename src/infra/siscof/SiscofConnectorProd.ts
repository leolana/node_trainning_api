// tslint:disable:no-magic-numbers
// tslint:disable:no-shadowed-variable

import { DateTime } from 'luxon';
import { injectable, inject } from 'inversify';

import SiscofCmd from './SiscofCmd';
import SiscofDb from './SiscofDb';
import SiscofFormatter from './SiscofFormatter';

import types from '../../constants/types';
import SiscofConnector from './SiscofConnector';

/* TODO:Paginação
  MaxArraySize: Para as procs que contenham no resultado campos do tipo Array,
  é necessário definir o tamanho do array de resposta.
  Caso o array retornado seja maior que o configurado, a execução termina com erro
  Para evitar alocação desnecessária de memória, será necessário implementar
  paginação nas procedures
 */
const printLog = true;
const defaultMaxArraySize = 1000;

const convertObj = (obj) => {
  const result = Object.keys(obj)
    .map(key => Object.values(obj[key])
      .join(';'));

  return result;
};

const log = (name, log) => {
  if (printLog) console.log(name, log);
};

/*
  Da forma como o Js está convertendo as datas,
  sempre gera problemas com as datas do oracle, dependendo se
  a data está dentro ou fora do horário de verão.
  O tratamento consiste em criar as datas como 12h, e usar
  TRUNC nas chamadas das procedures, pois não usamos
  hora nas consultas
  Caso seja necessário usar a hora, fazer um tratamento diferente
  Formato de data criado yyyy-MM-ddT12:00:00.0
*/
const convertDate = (strDate) => {
  // Formato de data 2016-01-01T05:00:00.0
  if ((strDate || null) == null) {
    return null;
  }
  if (strDate instanceof Date) {
    return new Date(`${strDate.toISOString().split('T')[0]}T12:00:00.0`);
  }
  if (strDate instanceof DateTime) {
    return new Date(`${strDate.toISODate().split('T')[0]}T12:00:00.0`);
  }

  const isFormated = strDate.indexOf('/') === 2;
  const isIso = strDate.indexOf('-') === 4;

  if (!isFormated && !isIso) {
    return null;
  }

  if (isFormated) {
    const split = strDate.split('/');
    if (split.length !== 3) {
      return null;
    }
    return new Date(split[2], split[1] - 1, split[0]);
  }
  if (isIso) {
    return new Date(`${strDate.split('T')[0]}T12:00:00.0`);
  }

  return null;
};
const convertToNumber = (str) => {
  if ((str || null) == null) {
    return null;
  }

  if (str.indexOf(',') >= 0) return parseFloat(str.replace(',', '.'));

  return parseFloat(str);
};
const siscofStatusCessao = {
  RCES: 1,
  ECES: 2,
  CCES: 3,
};
const siscofStatusRecebivel = {
  PP: 1,
  PE: 2,
  PC: 3,
};

const statusCessaoPortal = (statusSiscof) => {
  if ((statusSiscof || null) == null) {
    return null;
  }
  return siscofStatusCessao[statusSiscof];
};
const statusCessaoSiscof = (statusPortal) => {
  if ((statusPortal || null) == null) {
    return null;
  }
  return Object.keys(siscofStatusCessao).find(
    key => siscofStatusCessao[key] === statusPortal,
  );
};

const statusRecebivelPortal = (statusSiscof) => {
  if ((statusSiscof || null) == null) {
    return null;
  }
  return siscofStatusRecebivel[statusSiscof];
};

const convertObjToCsv = (obj) => {
  if (obj instanceof Array) {
    if (obj.length === 0) {
      return null;
    }
    return obj.join(';');
  }
  return obj;
};

const obterRelatorioCSV = (
  name,
  sqlProcedure,
  participanteId,
  dataOperacaoInicial,
  dataOperacaoFinal,
  db,
  cmd
) => {
  const maxArraySize = defaultMaxArraySize;
  const query = `BEGIN ALPE.${sqlProcedure}(
    :loja,
    TRUNC(CAST(:dt1 AS DATE)),
    TRUNC(CAST(:dt2 AS DATE)),
    :rownum,
    :nrtc,
    :wrtc,
    :y);
  END;`;
  const params = {
    loja: participanteId,
    dt1: convertDate(dataOperacaoInicial),
    dt2: convertDate(dataOperacaoFinal),
    rownum: maxArraySize, // Limita a qtde linhas retornadas pelo siscof
    nrtc: { dir: db.constants.BIND_OUT, type: db.constants.NUMBER },
    wrtc: { dir: db.constants.BIND_OUT, type: db.constants.STRING },
    y: {
      maxArraySize,
      dir: db.constants.BIND_OUT,
      type: db.constants.STRING,
      maxSize: 1000,
    },
  };
  return cmd
    .executeCommand(query, params, name)
    .then((result) => {
      if (result.outBinds.nrtc !== 0) {
        throw new Error(result.outBinds.wrtc);
      }

      return {
        ...result.outBinds,
        csv: result.outBinds.y.join('\n'),
      };
    });
};

@injectable()
class SiscofConnectorProd implements SiscofConnector {
  private cmd: SiscofCmd;
  private formatter: SiscofFormatter;
  private db: SiscofDb;

  constructor(
    @inject(types.SiscofCmd) cmd: SiscofCmd,
    @inject(types.SiscofFormatter) formatter: SiscofFormatter,
    @inject(types.SiscofDb) db: SiscofDb
  ) {
    this.cmd = cmd;
    this.formatter = formatter;
    this.db = db;
  }

  executeCommand = (query, params, name) => {
    const action = this.cmd.executeCommand(query, params, name);
    return action;
  }

  // Relátorios CSV
  obterRelatorioRemessaVendas = (
    participanteId,
    dataOperacaoInicial,
    dataOperacaoFinal
  ) => obterRelatorioCSV(
    'remessaVendas',
    'remessa_vendas',
    participanteId,
    dataOperacaoInicial,
    dataOperacaoFinal,
    this.db,
    this.cmd
  )

  obterRelatorioRegistroVendasDetalhe = (
    participanteId,
    dataOperacaoInicial,
    dataOperacaoFinal
  ) => obterRelatorioCSV(
    'registroVendasDetalhe',
    'retorno_vendas_det',
    participanteId,
    dataOperacaoInicial,
    dataOperacaoFinal,
    this.db,
    this.cmd
  )

  obterRelatorioRegistroVendasResumo = (
    participanteId,
    dataOperacaoInicial,
    dataOperacaoFinal
  ) => obterRelatorioCSV(
    'registroVendasResumo',
    'retorno_vendas_res',
    participanteId,
    dataOperacaoInicial,
    dataOperacaoFinal,
    this.db,
    this.cmd
  )

  obterRelatorioPagamentos = (
    participanteId,
    dataOperacaoInicial,
    dataOperacaoFinal
  ) => obterRelatorioCSV(
    'registroVendasResumo',
    'retorno_pagamentos',
    participanteId,
    dataOperacaoInicial,
    dataOperacaoFinal,
    this.db,
    this.cmd
  )

  obterRelatorioAjustesTarifas = (
    participanteId,
    dataOperacaoInicial,
    dataOperacaoFinal
  ) => obterRelatorioCSV(
    'registroVendasResumo',
    'retorno_ajustes_tarifas',
    participanteId,
    dataOperacaoInicial,
    dataOperacaoFinal,
    this.db,
    this.cmd
  )

  obterRelatorioFinanceiro = (
    participanteId,
    dataOperacaoInicial,
    dataOperacaoFinal
  ) => obterRelatorioCSV(
    'registroVendasResumo',
    'retorno_financeiro',
    participanteId,
    dataOperacaoInicial,
    dataOperacaoFinal,
    this.db,
    this.cmd
  )

  // 1 - Cadastro de EC / Fornecedor
  incluirEstabelecimento = (objEstabelecimento) => {
    const params = {
      ipf_pj: objEstabelecimento.ipf_pj, // F ou J
      loja: objEstabelecimento.Loja,
      MID: null,
      TID: null,
      CPF_CNPJ: objEstabelecimento.CPF_CNPJ,
      RazaoSocial: objEstabelecimento.RazaoSocial,
      NomeFantasia: objEstabelecimento.NomeFantasia,
      NomeMae: objEstabelecimento.NomeMae,
      PermiteAntecipacao: null,
      InscricaoEstadual: objEstabelecimento.InscricaoEstadual,
      InscricaoMunicipal: objEstabelecimento.InscricaoMunicipal,
      CEP: objEstabelecimento.CEP,
      Endereco: objEstabelecimento.Endereco,
      Numero: objEstabelecimento.Numero,
      Bairro: objEstabelecimento.Bairro,
      Cidade: objEstabelecimento.Cidade,
      Estado: objEstabelecimento.Estado,
      DataAbertura: convertDate(objEstabelecimento.DataAbertura),
      Complemento: objEstabelecimento.Complemento,
      Telefone1: objEstabelecimento.Telefone1,
      Telefone2: objEstabelecimento.Telefone2,
      Responsavel: objEstabelecimento.Responsavel,
      Celular: objEstabelecimento.Celular,
      IdEndCorrespondencia: null,
      CepCorrespondencia: objEstabelecimento.CepCorrespondencia,
      EndCorrespondencia: objEstabelecimento.EndCorrespondencia,
      NumEndCorrespondencia: objEstabelecimento.NumEndCorrespondencia,
      BairroCorrespondencia: objEstabelecimento.BairroCorrespondencia,
      CidadeCorrespondencia: objEstabelecimento.CidadeCorrespondencia,
      EstadoCorrespondencia: objEstabelecimento.EstadoCorrespondencia,
      ComplementoCorrespondencia:
        objEstabelecimento.ComplementoCorrespondencia,
      Responsavel1: objEstabelecimento.Responsavel1,
      CPF1: objEstabelecimento.CPF1,
      DataNascimento1: convertDate(objEstabelecimento.DataNascimento1),
      Participacao1: objEstabelecimento.Participacao1 ? objEstabelecimento.Participacao1.toString() : undefined,
      Email1: objEstabelecimento.Email1,
      Rg1: objEstabelecimento.Rg1,
      Celular1: objEstabelecimento.Celular1,
      NomeMae1: objEstabelecimento.NomeMae1,
      Responsavel2: objEstabelecimento.Responsavel2,
      CPF2: objEstabelecimento.CPF2,
      DataNascimento2: convertDate(objEstabelecimento.DataNascimento2),
      Participacao2: objEstabelecimento.Participacao2 ? objEstabelecimento.Participacao2.toString() : undefined,
      Email2: objEstabelecimento.Email2,
      Rg2: objEstabelecimento.Rg2,
      Celular2: objEstabelecimento.Celular2,
      NomeMae2: objEstabelecimento.NomeMae2,
      Responsavel3: objEstabelecimento.Responsavel3,
      CPF3: objEstabelecimento.CPF3,
      DataNascimento3: convertDate(objEstabelecimento.DataNascimento3),
      Participacao3: objEstabelecimento.Participacao3 ? objEstabelecimento.Participacao3.toString() : undefined,
      Email3: objEstabelecimento.Email3,
      Rg3: objEstabelecimento.Rg3,
      Celular3: objEstabelecimento.Celular3,
      NomeMae3: objEstabelecimento.NomeMae3,
      HorarioFuncionamento: objEstabelecimento.HorarioFuncionamento,
      PontoReferencia: objEstabelecimento.PontoReferencia,
      IdentificadorEcommerce: objEstabelecimento.IdentificadorEcommerce,
      URL: null,
      Email: objEstabelecimento.Email,
      // Array
      // Bandeira;Banco;Agencia;AgenciaDv;TipoConta;Conta;ContaDv
      Ref_Banco: {
        type: this.db.constants.STRING,
        dir: this.db.constants.BIND_IN,
        val: convertObj(objEstabelecimento.Ref_Banco),
      },
      // Array
      // -Marca (,,);Produto (POS com fio, POS sem fio, TEF);
      // TipoCaptura(Venda, Aluguel);Quantidade;Valor
      Equipamentos: {
        type: this.db.constants.STRING,
        dir: this.db.constants.BIND_IN,
        val: convertObj(objEstabelecimento.Equipamentos),
      },
      URL_E_Commerce: objEstabelecimento.URL_E_Commerce,
      DataCadastro: objEstabelecimento.DataCadastro,
      DataAtualizacao: objEstabelecimento.DataAtualizacao,
      MCC: objEstabelecimento.MCC,
      TipoCanal: null,
      // Array
      // Adquirente(Fixo 5);Bandeira;CodEvento(1,2,3,4);Tx_adm;
      // Tx_antecipacao;DiasAntecipacao
      Taxas: {
        type: this.db.constants.STRING,
        dir: this.db.constants.BIND_IN,
        val: convertObj(objEstabelecimento.Taxas),
      },
      TaxasCessao: {
        type: this.db.constants.STRING,
        dir: this.db.constants.BIND_IN,
        val: convertObj(objEstabelecimento.TaxasCessao),
      },
      Cessionario: objEstabelecimento.Cessionario, // S ou N
      Funcao: objEstabelecimento.isAlteracao ? 'UPDATE' : 'INSERT',
      // out
      nrtc: { dir: this.db.constants.BIND_OUT, type: this.db.constants.NUMBER },
      wrtc: { dir: this.db.constants.BIND_OUT, type: this.db.constants.STRING },
    };
    log('params.Ref_Banco', params.Ref_Banco);
    log('params.Ref_Banco.val', params.Ref_Banco.val);
    const query = `BEGIN ALPE.INCLUI_CLIENTE_V2(
      :ipf_pj,
      :loja,
      :MID,
      :TID,
      :CPF_CNPJ,
      :RazaoSocial,
      :NomeFantasia,
      :NomeMae,
      :PermiteAntecipacao,
      :InscricaoEstadual,
      :InscricaoMunicipal,
      :CEP,
      :Endereco,
      :Numero,
      :Bairro,
      :Cidade,
      :Estado,
      TRUNC(CAST(:DataAbertura AS DATE)),
      :Complemento,
      :Telefone1,
      :Telefone2,
      :Responsavel,
      :Celular,
      :IdEndCorrespondencia,
      :CepCorrespondencia,
      :EndCorrespondencia,
      :NumEndCorrespondencia,
      :BairroCorrespondencia,
      :CidadeCorrespondencia,
      :EstadoCorrespondencia,
      :ComplementoCorrespondencia,
      :Responsavel1,
      :CPF1,
      TRUNC(CAST(:DataNascimento1 AS DATE)),
      :Participacao1,
      :Email1,
      :Rg1,
      :Celular1,
      :NomeMae1,
      :Responsavel2,
      :CPF2,
      TRUNC(CAST(:DataNascimento2 AS DATE)),
      :Participacao2,
      :Email2,
      :Rg2,
      :Celular2,
      :NomeMae2,
      :Responsavel3,
      :CPF3,
      TRUNC(CAST(:DataNascimento3 AS DATE)),
      :Participacao3,
      :Email3,
      :Rg3,
      :Celular3,
      :NomeMae3,
      :HorarioFuncionamento,
      :PontoReferencia,
      :IdentificadorEcommerce,
      :URL,
      :Email,
      :Ref_Banco,
      :Equipamentos,
      :URL_E_Commerce,
      :DataCadastro,
      :DataAtualizacao,
      :MCC,
      :TipoCanal,
      :Taxas,
      :Cessionario,
      :Funcao,
      :TaxasCessao,
      :nrtc,
      :wrtc);
    END;`;
    return this.cmd
      .executeCommand(query, params, 'incluirCessionarioEC')
      .then(result => result.outBinds);
  }
  // 2 - Cadastro Cessionário X EC
  incluirCessionarioEC = (cessionario, ec) => {
    const params = {
      cessionario,
      ec,
      wrtc: { dir: this.db.constants.BIND_OUT, type: this.db.constants.NUMBER },
      wmsg: { dir: this.db.constants.BIND_OUT, type: this.db.constants.STRING },
    };
    const query = `BEGIN ALPE.INCLUI_CESSIONARIO_EC(
      :cessionario,
      :ec,
      :wrtc,
      :wmsg);
    END;`;
    return this.cmd
      .executeCommand(query, params, 'incluirCessionarioEC')
      .then(result => result.outBinds);
  }
  excluirCessionarioEC = (cessionario, ec) => {
    const params = {
      cessionario,
      ec,
      wrtc: { dir: this.db.constants.BIND_OUT, type: this.db.constants.NUMBER },
      wmsg: { dir: this.db.constants.BIND_OUT, type: this.db.constants.STRING },
    };
    const query = `BEGIN ALPE.EXCLUI_CESSIONARIO_EC(
      :cessionario,
      :ec,
      :wrtc,
      :wmsg);
    END;`;
    return this.cmd
      .executeCommand(query, params, 'excluirCessionarioEC')
      .then(result => result.outBinds);
  }
  // 2.1 - Taxa Cessionário
  consultarTarifaCessionario = (cessionario, maxArraySizeParam = null) => {
    const maxArraySize = maxArraySizeParam == null
      ? defaultMaxArraySize
      : maxArraySizeParam;

    const params = {
      cessionario,
      nrtc: { dir: this.db.constants.BIND_OUT, type: this.db.constants.NUMBER },
      wrtc: { dir: this.db.constants.BIND_OUT, type: this.db.constants.STRING },
      valor: { dir: this.db.constants.BIND_OUT, type: this.db.constants.NUMBER },
      y: {
        maxArraySize,
        dir: this.db.constants.BIND_OUT,
        type: this.db.constants.STRING,
      },
    };
    const query = `BEGIN ALPE.CONSULTA_TARIFA_CESSAON_V2(
      :cessionario,
      :nrtc,
      :wrtc,
      :valor,
      :y);
    END;`;
    return this.cmd
      .executeCommand(query, params, 'consultarTarifaCessionario')
      .then((result) => {
        result.outBinds.taxas = [];

        let i = 0;
        result.outBinds.y.forEach((taxa) => {
          const linha = taxa.split(';');
          if (i === 0) {
            result.outBinds.taxaAntecipacao = convertToNumber(linha[6]);
            // tslint:disable-next-line:no-increment-decrement
            i++;
          }
          if (linha.length >= 9) {
            const obj = {
              // codigoEstabelecimento   : linha[0],
              // nomeEstabelecimento     : linha[1],
              sequencia: linha[2],
              valorInicio: convertToNumber(linha[3]),
              valorFim: convertToNumber(linha[4]),
              taxaCessao: convertToNumber(linha[5]),
              // txAntecipacao           : linha[6],
              // txAntecipacaoAuto       : linha[7],
              // diasRecebimento         : linha[8],
            };
            result.outBinds.taxas.push(obj);
          }
        });
        return result.outBinds;
      });
  }
  // 3 - Solicitar Cessão (Fornecedor)
  solicitarCessao = (objCessao) => {
    // TODO: Não usar até ter paginação
    const maxArraySize = objCessao.maxArraySize == null
      ? defaultMaxArraySize
      : objCessao.maxArraySize;
    const params = {
      cessionario: objCessao.cessionario,
      ec: objCessao.estabelecimento,
      dtReserva: convertDate(objCessao.dtReservaCessao),
      valorReserva: objCessao.valorReserva.toString(),
      notaFiscal: null,
      diasDiluicao:
        (objCessao.diluicaoPagamento || null) == null
          ? 0
          : objCessao.diluicaoPagamento,
      nrtc: { dir: this.db.constants.BIND_OUT, type: this.db.constants.NUMBER },
      wrtc: { dir: this.db.constants.BIND_OUT, type: this.db.constants.STRING },
      nValor: { dir: this.db.constants.BIND_OUT, type: this.db.constants.NUMBER },
      y: {
        maxArraySize,
        dir: this.db.constants.BIND_OUT,
        type: this.db.constants.STRING,
      },
    };
    const query = `BEGIN ALPE.FAZ_RESERVA_CESSAO_V2(
      :cessionario,
      :ec,
      TRUNC(:dtReserva),
      :valorReserva,
      :notaFiscal,
      :diasDiluicao,
      :nrtc,
      :wrtc,
      :nValor,
      :y);
    END;`;
    return this.cmd
      .executeCommand(query, params, 'solicitarCessao')
      .then((result) => {
        result.outBinds.recebiveis = [];
        result.outBinds.y.forEach((recebivel) => {
          const linha = recebivel.split(';');
          if (linha.length >= 11) {
            const obj = {
              // codCessao             : linha[0],
              // statusCessao          : linha[1],
              eventoId: linha[2],
              dataVenda: convertDate(linha[3]),
              valorVenda: convertToNumber(linha[4]),
              dataReserva: convertDate(linha[5]),
              dataPagarEc: convertDate(linha[6]),
              valorPagarEc: convertToNumber(linha[7]),
              nsu: linha[8],
              numeroParcela: linha[9],
              totalParcelas: linha[10],
              statusPagamento: statusRecebivelPortal('PP'),
              bandeira: this.formatter.getBandeiraPortal(linha[11]),
            };
            result.outBinds.recebiveis.push(obj);
          }
        });
        return result.outBinds;
      });
  }

  // 3 - Solicitar Cessão Parcelada(Fornecedor)
  solicitarCessaoParcelada = (objCessao) => {
    // TODO: Não usar até ter paginação
    const maxArraySize = objCessao.maxArraySize == null
      ? defaultMaxArraySize
      : objCessao.maxArraySize;
    const params = {
      cessionario: objCessao.cessionario,
      ec: objCessao.estabelecimento,
      dtReserva: convertDate(objCessao.dtReservaCessao),
      valorReserva: objCessao.valorReserva.toString(),
      notaFiscal: null,
      diasDiluicao:
        (objCessao.diluicaoPagamento || null) == null
          ? 0
          : objCessao.diluicaoPagamento,
      qtParcelas: objCessao.numeroParcelas,
      vlParcelas: convertObjToCsv(objCessao.valorParcelas),
      nrtc: { dir: this.db.constants.BIND_OUT, type: this.db.constants.NUMBER },
      wrtc: { dir: this.db.constants.BIND_OUT, type: this.db.constants.STRING },
      nValor: { dir: this.db.constants.BIND_OUT, type: this.db.constants.NUMBER },
      y: {
        maxArraySize,
        dir: this.db.constants.BIND_OUT,
        type: this.db.constants.STRING,
      },
    };
    const query = `BEGIN ALPE.FAZ_RESERVA_CESSAO_PARCELADA(
      :cessionario,
      :ec,
      TRUNC(CAST(:dtReserva AS DATE)),
      :valorReserva,
      :notaFiscal,
      :diasDiluicao,
      :qtParcelas,
      :vlParcelas,
      :nrtc,
      :wrtc,
      :nValor,
      :y);
    END;`;
    return this.cmd
      .executeCommand(query, params, 'solicitarCessaoParcelada')
      .then((result) => {
        result.outBinds.recebiveis = [];
        result.outBinds.y.forEach((recebivel) => {
          const linha = recebivel.split(';');
          if (linha.length >= 11) {
            const obj = {
              // codCessao             : linha[0],
              // statusCessao          : linha[1],
              eventoId: linha[2],
              dataVenda: convertDate(linha[3]),
              valorVenda: convertToNumber(linha[4]),
              dataReserva: convertDate(linha[5]),
              dataPagarEc: convertDate(linha[6]),
              valorPagarEc: convertToNumber(linha[7]),
              nsu: linha[8],
              numeroParcela: linha[9],
              totalParcelas: linha[10],
              numeroParcelaCessao: linha[11],
              statusPagamento: statusRecebivelPortal('PP'),
            };
            result.outBinds.recebiveis.push(obj);
          }
        });
        return result.outBinds;
      });
  }

  // 4 - Cancelamento Cessão (Reserva)
  excluirCessao = (cessaoId) => {
    const params = {
      cessao: cessaoId,
      nrtc: { dir: this.db.constants.BIND_OUT, type: this.db.constants.NUMBER },
      wrtc: { dir: this.db.constants.BIND_OUT, type: this.db.constants.STRING },
      nValor: { dir: this.db.constants.BIND_OUT, type: this.db.constants.NUMBER },
    };
    const query = `BEGIN ALPE.EXCLUI_RESERVA_CESSAO(
      :cessao,
      :nrtc,
      :wrtc,
      :nValor);
    END;`;
    return this.cmd
      .executeCommand(query, params, 'excluirCessao')
      .then(result => result.outBinds);
  }
  // 5 - Efetivar Cessão (EC)
  efetivarCessao = (cessaoId, notaFiscal) => {
    const params = {
      notaFiscal,
      cessao: cessaoId,
      wrtc: { dir: this.db.constants.BIND_OUT, type: this.db.constants.NUMBER },
      wmsg: { dir: this.db.constants.BIND_OUT, type: this.db.constants.STRING },
    };
    const query = `BEGIN ALPE.INCLUI_CESSAO(
      :cessao,
      :notaFiscal,
      :wrtc,
      :wmsg);
    END;`;
    return this.cmd
      .executeCommand(query, params, 'efetivarCessao')
      .then(result => result.outBinds);
  }
  // 6 - Cancelamento Itens Cedidos

  // 7.3 - Listar Cessões
  listarCessoes = (objCessao) => {
    // TODO: Não usar até ter paginação
    const maxArraySize = objCessao.maxArraySize == null
      ? defaultMaxArraySize
      : objCessao.maxArraySize;
    const params = {
      loja: objCessao.estabelecimento,
      cessionario: objCessao.fornecedor,
      datai: convertDate(objCessao.dataIni),
      dataf: convertDate(objCessao.dataFim),
      status_ces: statusCessaoSiscof(objCessao.status_cessao),
      cessao: objCessao.cessao,
      wrtc: { dir: this.db.constants.BIND_OUT, type: this.db.constants.NUMBER },
      wmsg: { dir: this.db.constants.BIND_OUT, type: this.db.constants.STRING },
      linha: {
        maxArraySize,
        dir: this.db.constants.BIND_OUT,
        type: this.db.constants.STRING,
      },
    };
    const query = `BEGIN ALPE.GET_CESSAO(
      :loja,
      :cessionario,
      TRUNC(CAST(:datai AS DATE)),
      TRUNC(CAST(:dataf AS DATE)),
      :status_ces,
      :cessao,
      :wrtc,
      :wmsg,
      :linha);
    END;`;
    return this.cmd
      .executeCommand(query, params, 'listarCessoes')
      .then((result) => {
        result.outBinds.cessoes = [];
        result.outBinds.linha.forEach((cessao) => {
          const linha = cessao.split(';');
          if (linha.length >= 5) {
            const obj = {
              cessaoId: linha[0],
              dataVencimento: convertDate(linha[1]),
              status: statusCessaoPortal(linha[2]),
              // nomeEstabelecimento   : linha[3],
              valor: convertToNumber(linha[4]),
            };
            result.outBinds.cessoes.push(obj);
          }
        });
        return result.outBinds;
      });
  }
  // 7.3 - Detalhe Cessão
  listarCessoesDetalhe = (objCessao) => {
    // TODO: Não usar até ter paginação
    const maxArraySize = objCessao.maxArraySize == null
      ? defaultMaxArraySize
      : objCessao.maxArraySize;
    const params = {
      loja: objCessao.estabelecimento,
      cessionario: objCessao.fornecedor,
      datai: convertDate(objCessao.dataIni),
      dataf: convertDate(objCessao.dataFim),
      status_ces: statusCessaoSiscof(objCessao.status_cessao),
      cessao: objCessao.cessao,
      wrtc: { dir: this.db.constants.BIND_OUT, type: this.db.constants.NUMBER },
      wmsg: { dir: this.db.constants.BIND_OUT, type: this.db.constants.STRING },
      linha: {
        maxArraySize,
        dir: this.db.constants.BIND_OUT,
        type: this.db.constants.STRING,
      },
    };
    const query = `BEGIN ALPE.GET_MOVTOS_CESSAO(
      :loja,
      :cessionario,
      TRUNC(CAST(:datai AS DATE)),
      TRUNC(CAST(:dataf AS DATE)),
      :status_ces,
      :cessao,
      :wrtc,
      :wmsg,
      :linha);
    END;`;
    return this.cmd
      .executeCommand(query, params, 'listarCessoesDetalhe')
      .then((result) => {
        result.outBinds.recebiveis = [];
        result.outBinds.linha.forEach((recebiveis) => {
          const linha = recebiveis.split(';');
          if (linha.length >= 12) {
            const obj = {
              // codCessao             : linha[0]
              statusPagamento: statusRecebivelPortal(linha[1]),
              eventoId: parseInt(linha[2], 10),
              dataVenda: convertDate(linha[3]),
              valorVenda: convertToNumber(linha[4]),
              dataReserva: convertDate(linha[5]),
              dataPagarEc: convertDate(linha[6]),
              valorPagarEc: convertToNumber(linha[7]),
              nsu: linha[8],
              numeroParcela: linha[9],
              totalParcelas: linha[10],
              bandeira: this.formatter.getBandeiraPortal(linha[11]),
              numeroParcelaCessao: linha[12],
            };
            result.outBinds.recebiveis.push(obj);
          }
        });
        return result.outBinds;
      });
  }
  // 8 - Solicitação de Antecipação
  listarMovimentosParaAntecipar = (objFiltro) => {
    // TODO: Não usar até ter paginação
    const maxArraySize = objFiltro.maxArraySize == null
      ? defaultMaxArraySize
      : objFiltro.maxArraySize;

    const bandeirasConvertidas = [];
    if (!((objFiltro.bandeirasId || null) == null)) {
      objFiltro.bandeirasId.forEach((bandeira) => {
        bandeirasConvertidas.push(this.formatter.getBandeiraSiscof(bandeira));
      });
    }

    const params = {
      cessionario: objFiltro.cessionario,
      dt_inicio: convertDate(objFiltro.mesInicio),
      dt_fim: convertDate(objFiltro.mesFim),
      bandeira: convertObjToCsv(bandeirasConvertidas),
      evento: convertObjToCsv(objFiltro.produtoId),
      dt_venda_inicio: convertDate(objFiltro.dataVendaInicio),
      dt_venda_fim: convertDate(objFiltro.dataVendaFim),
      rownum: maxArraySize, // Limita a qtde linhas retornadas pelo siscof
      wrtc: { dir: this.db.constants.BIND_OUT, type: this.db.constants.NUMBER },
      wmsg: { dir: this.db.constants.BIND_OUT, type: this.db.constants.STRING },
      linha: {
        maxArraySize,
        dir: this.db.constants.BIND_OUT,
        type: this.db.constants.STRING,
      },
    };
    const query = `BEGIN ALPE.GET_ANTECIPACOES_V3(
      :cessionario,
      TRUNC(CAST(:dt_inicio AS DATE)),
      TRUNC(CAST(:dt_fim AS DATE)),
      :bandeira,
      :evento,
      TRUNC(CAST(:dt_venda_inicio AS DATE)),
      TRUNC(CAST(:dt_venda_fim AS DATE)),
      :rownum,
      :wrtc,
      :wmsg,
      :linha);
    END;`;
    return this.cmd
      .executeCommand(query, params, 'listarMovimentosParaAntecipar')
      .then((result) => {
        result.outBinds.movimentos = [];
        result.outBinds.linha.forEach((movimento) => {
          const linha = movimento.split(';');
          if (linha.length >= 14) {
            const obj = {
              dataAntecipacao: convertDate(linha[0]),
              dataPagamento: convertDate(linha[1]),
              // Previsão pagamento (dt_pagar_loja)
              diasAntecipacao: convertToNumber(linha[2]),
              // Dias antecipação (calculado)
              valorPagar: convertToNumber(linha[3]),
              // Valor líquido da parcela(vl_pagar_loja)
              taxaAntecipacao: convertToNumber(linha[4]),
              // % taxa de antecipação(calculado)
              descontoAntecipacao: convertToNumber(linha[5]),
              // Valor do desconto antecipação(calculado)
              valorAntecipado: convertToNumber(linha[6]),
              // Valor líquido à antecipar(calculado)
              rowId: linha[7], // RowId
              bandeiraId:
              convertToNumber(this.formatter.getBandeiraPortal(linha[8])),
              // Bandeira (org)
              eventoId: convertToNumber(linha[9]), // Modalidade (evento)
              dataVenda: convertDate(linha[10]),
              // Data da Venda(dt_operacao)
              valorVenda: convertToNumber(linha[11]),
              // Valor venda(vl_operacao)
              parcelaAtual: convertToNumber(linha[12]),
              // Plano(no_parcela)
              qtdeParcelas: convertToNumber(linha[13]),
              // Plano(parcelas)
              valorParcela: convertToNumber(linha[14]),
              // Valor da parcela (vl_bruto_parcela)
              nsu: convertToNumber(linha[15]), // Nsu (tid)
              valorDescontoMdr: convertToNumber(linha[16]),
              // Valor do desconto Mdr (desconto_arv)
              autorizacao: linha[17], // autorização
            };
            result.outBinds.movimentos.push(obj);
          }
        });

        return result.outBinds;
      });
  }
  consultarAntecipacaoRealizada = (objFiltro) => {
    // TODO: Não usar até ter paginação
    const maxArraySize = objFiltro.maxArraySize == null
      ? defaultMaxArraySize
      : objFiltro.maxArraySize;

    const bandeirasConvertidas = [];
    if (!((objFiltro.bandeirasId || null) == null)) {
      objFiltro.bandeirasId.forEach((bandeira) => {
        bandeirasConvertidas.push(this.formatter.getBandeiraSiscof(bandeira));
      });
    }

    const params = {
      cessionario: objFiltro.cessionario,
      dt_inicio: convertDate(objFiltro.mesInicio),
      dt_fim: convertDate(objFiltro.mesFim),
      bandeira: convertObjToCsv(bandeirasConvertidas),
      evento: convertObjToCsv(objFiltro.produtoId),
      dt_pagamento: convertDate(objFiltro.dataPagamento),
      dt_solicitacao: convertDate(objFiltro.dataSolicitacao),
      cd_antecipacao: objFiltro.codigo,
      rownum: maxArraySize, // Limita a qtde linhas retornadas pelo siscof
      wrtc: { dir: this.db.constants.BIND_OUT, type: this.db.constants.NUMBER },
      wmsg: { dir: this.db.constants.BIND_OUT, type: this.db.constants.STRING },
      linha: {
        maxArraySize,
        dir: this.db.constants.BIND_OUT,
        type: this.db.constants.STRING,
      },
    };
    const query = `BEGIN ALPE.GET_ANTECIPACOES_REALIZADAS(
      :cessionario,
      TRUNC(CAST(:dt_inicio AS DATE)),
      TRUNC(CAST(:dt_fim AS DATE)),
      :bandeira,
      :evento,
      TRUNC(CAST(:dt_pagamento AS DATE)),
      TRUNC(CAST(:dt_solicitacao AS DATE)),
      :cd_antecipacao,
      :rownum,
      :wrtc,
      :wmsg,
      :linha);
    END;`;
    return this.cmd
      .executeCommand(query, params, 'consultarAntecipacaoRealizada')
      .then((result) => {
        result.outBinds.movimentos = [];
        result.outBinds.linha.forEach((movimento) => {
          const linha = movimento.split(';');
          if (linha.length >= 14) {
            const obj = {
              rowId: linha[0], // RowId
              dataVenda: convertDate(linha[1]),
              // Data da Venda(dt_operacao)
              bandeiraId:
              convertToNumber(this.formatter.getBandeiraPortal(linha[2])),
              // Bandeira (org)
              eventoId: convertToNumber(linha[3]), // Modalidade (evento)
              parcelaAtual: convertToNumber(linha[4]),
              // Plano(no_parcela)
              qtdeParcelas: convertToNumber(linha[5]), // Plano(parcelas)
              nsu: convertToNumber(linha[6]), // Nsu (tid)
              valorVenda: convertToNumber(linha[7]),
              // Valor venda(vl_operacao)
              valorParcela: convertToNumber(linha[8]),
              // Valor da parcela (vl_bruto_parcela)
              valorDescontoMdr: convertToNumber(linha[9]),
              // Valor do desconto Mdr (desconto_arv)
              valorPagar: convertToNumber(linha[10]),
              // Valor líquido da parcela(vl_pagar_loja)
              taxaAntecipacao: convertToNumber(linha[11]),
              // % taxa de antecipação(calculado)
              descontoAntecipacao: convertToNumber(linha[12]),
              // Valor do desconto antecipação(calculado)
              valorAntecipado: convertToNumber(linha[13]),
              // Valor líquido à antecipar(calculado)
              dataAntecipacao: convertDate(linha[14]),
              codigo: convertToNumber(linha[15]), // codigo
              domicilioBancario: linha[16], // Domicilio Bancário
              dataPagamento: convertDate(linha[17]),
              // Previsão pagamento (dt_pagar_loja)
              valorSolicitado: convertToNumber(linha[18]),
              // Valor do desconto Mdr (desconto_arv)
              nsuOriginal: linha[19], // nsuOriginal
              dataPagarLojaOriginal: convertDate(linha[20]),
                    // previsão de pagamento (dataPagamentoOriginal)
              autorizacao: linha[21], // autorizacao
            };
            result.outBinds.movimentos.push(obj);
          }
        });

        return result.outBinds;
      });
  }
  getAntecipacoesConsolidado = (objFiltro) => {
    // TODO: Não usar até ter paginação
    const maxArraySize = objFiltro.maxArraySize == null
      ? defaultMaxArraySize
      : objFiltro.maxArraySize;

    const params = {
      ploja: objFiltro.idFornecedor,
      pdata_solicitacao_ini: convertDate(objFiltro.dataSolicitacaoDesde),
      pdata_solicitacao_fim: convertDate(objFiltro.dataSolicitacaoAte),
      rownum: maxArraySize, // Limita a qtde linhas retornadas pelo siscof
      wrtc: { dir: this.db.constants.BIND_OUT, type: this.db.constants.NUMBER },
      wmsg: { dir: this.db.constants.BIND_OUT, type: this.db.constants.STRING },
      linha: {
        maxArraySize,
        dir: this.db.constants.BIND_OUT,
        type: this.db.constants.STRING,
      },
    };
    const query = `BEGIN ALPE.get_antecipacoes_consolidado(
      :ploja,
      TRUNC(CAST(:pdata_solicitacao_ini AS DATE)),
      TRUNC(CAST(:pdata_solicitacao_fim AS DATE)),
      :rownum,
      :wrtc,
      :wmsg,
      :linha);
    END;`;
    return this.cmd
      .executeCommand(query, params, 'getAntecipacoesConsolidado')
      .then((result) => {
        result.outBinds.antecipacoes = [];
        result.outBinds.linha.forEach((antecipacao) => {
          const linha = antecipacao.split(';');
          if (linha.length >= 5) {
            const obj = {
              codigoAntecipacao: linha[0], // codigo Antecipacao
              dataSolicitacao: convertDate(linha[1]), // tbl_file_banco
              valorSolicitado: linha[2], // valorSolicitado
              valorDescontoAntecipacao: linha[3], // DESCONTO_ARV
              valorAntecipado: linha[4], // valorAntecipado(vl_pagar_loja)
            };
            result.outBinds.antecipacoes.push(obj);
          }
        });

        return result.outBinds;
      });
  }
  getCessoesRealizadas = (objFiltro) => {
    // TODO: Não usar até ter paginação
    const maxArraySize = objFiltro.maxArraySize == null
      ? defaultMaxArraySize
      : objFiltro.maxArraySize;

    const params = {
      ploja: objFiltro.idFornecedor,
      pdata_solicitacao_ini: convertDate(objFiltro.dataSolicitacaoDesde),
      pdata_solicitacao_fim: convertDate(objFiltro.dataSolicitacaoAte),
      rownum: maxArraySize, // Limita a qtde linhas retornadas pelo siscof
      wrtc: { dir: this.db.constants.BIND_OUT, type: this.db.constants.NUMBER },
      wmsg: { dir: this.db.constants.BIND_OUT, type: this.db.constants.STRING },
      linha: {
        maxArraySize,
        dir: this.db.constants.BIND_OUT,
        type: this.db.constants.STRING,
      },
    };
    const query = `BEGIN ALPE.get_cessoes_realizadas(
      :ploja,
      TRUNC(CAST(:pdata_solicitacao_ini AS DATE)),
      TRUNC(CAST(:pdata_solicitacao_fim AS DATE)),
      :rownum,
      :wrtc,
      :wmsg,
      :linha);
    END;`;
    return this.cmd
      .executeCommand(query, params, 'getCessoesRealizadas')
      .then((result) => {
        result.outBinds.cessoes = [];
        result.outBinds.linha.forEach((cessao) => {
          const linha = cessao.split(';');
          if (linha.length >= 6) {
            const obj = {
              codigoCessao: linha[0], // codigo Cessao(codigoCessao)
              codigoLoja: linha[1], // codigoLoja (tbl_cessao.ID_LOJA)
              nomeFantasia: linha[2], // nomeFantasia (Nome Fantasia)
              cnpj: linha[3], // cnpj_loja
              dataSolicitacao: convertDate(linha[4]), // dataSolicitacao
              valor: linha[5], // valor
            };
            result.outBinds.cessoes.push(obj);
          }
        });

        return result.outBinds;
      });
  }
  efetivarAntecipacao = (objAntecipacoes) => {
    const maxArraySize = objAntecipacoes.maxArraySize == null
      ? defaultMaxArraySize
      : objAntecipacoes.maxArraySize;
    const params = {
      cessionario: objAntecipacoes.cessionario,
      dt_antecipacao: convertDate(objAntecipacoes.dataAntecipacao),
      rowIds: convertObjToCsv(objAntecipacoes.rowIds),
      wrtc: { dir: this.db.constants.BIND_OUT, type: this.db.constants.NUMBER },
      wmsg: { dir: this.db.constants.BIND_OUT, type: this.db.constants.STRING },
      y: {
        maxArraySize,
        dir: this.db.constants.BIND_OUT,
        type: this.db.constants.STRING,
      },
    };
    const query = `BEGIN ALPE.EFETIVA_ANTECIPACOES_V2(
      :cessionario,
      TRUNC(CAST(:dt_antecipacao AS DATE)),
      :rowIds,
      :wrtc,
      :wmsg,
      :y);
    END;`;
    return this.cmd
      .executeCommand(query, params, 'efetivarAntecipacao')
      .then((result) => {
        result.outBinds.movimentos = [];
        result.outBinds.y.forEach((movimento) => {
          const linha = movimento.split(';');
          if (linha.length >= 14) {
            const obj = {
              dataAntecipacao: convertDate(linha[0]),
              dataPagamento: convertDate(linha[1]),
              diasAntecipacao: convertToNumber(linha[2]),
              valorPagar: convertToNumber(linha[3]),
              taxaAntecipacao: convertToNumber(linha[4]),
              descontoAntecipacao: convertToNumber(linha[5]),
              valorAntecipado: convertToNumber(linha[6]),
              rowId: linha[7],
              bandeira: this.formatter.getBandeiraPortal(linha[8]),
              evento: linha[9],
              dataVenda: convertDate(linha[10]),
              valorVenda: convertToNumber(linha[11]),
              parcelaAtual: convertToNumber(linha[12]),
              qtdeParcelas: convertToNumber(linha[13]),
            };
            result.outBinds.movimentos.push(obj);
          }
        });

        return result.outBinds;
      });
  }

  // 9 - Consulta Valor disponível de Cessão (Limite)
  consultarValorDisponivelCessao = (objCessao) => {
    const params = {
      cessionario: objCessao.cessionario,
      loja: objCessao.estabelecimento,
      nrtc: { dir: this.db.constants.BIND_OUT, type: this.db.constants.NUMBER },
      wrtc: { dir: this.db.constants.BIND_OUT, type: this.db.constants.STRING },
      nValor: { dir: this.db.constants.BIND_OUT, type: this.db.constants.NUMBER },
    };
    const query = `BEGIN ALPE.get_limite_cessao(
      :cessionario,
      :loja,
      :nrtc,
      :wrtc,
      :nValor);
    END;`;
    return this.cmd
      .executeCommand(query, params, 'consultarValorDisponivelCessao')
      .then(result => result.outBinds);
  }

  consultarValorDisponivelCessaoParcelada = (objCessao) => {
    const maxArraySize = 10;
    const params = {
      cessionario: objCessao.cessionario,
      loja: objCessao.estabelecimento,
      dataVencimento: convertDate(objCessao.dataVencimento),
      lista_rowid: 'N',
      nrtc: { dir: this.db.constants.BIND_OUT, type: this.db.constants.NUMBER },
      wrtc: { dir: this.db.constants.BIND_OUT, type: this.db.constants.STRING },
      nValores: {
        maxArraySize,
        dir: this.db.constants.BIND_OUT,
        type: this.db.constants.STRING,
      },
    };
    const query = `BEGIN ALPE.get_limite_cessao_parcelada(
      :cessionario,
      :loja,
      TRUNC(CAST(:dataVencimento AS DATE)),
      :lista_rowid,
      :nrtc,
      :wrtc,
      :nValores);
    END;`;
    return this.cmd
      .executeCommand(
        query,
        params,
        'consultarValorDisponivelCessaoParcelada',
      )
      .then((result) => {
        result.outBinds.disponiveis = [];
        result.outBinds.nValores.forEach((disponiveis) => {
          const linha = disponiveis.split(';');
          if (linha.length >= 2) {
            const obj = {
              periodo: convertToNumber(linha[0]),
              valor: convertToNumber(linha[1]),
            };
            result.outBinds.disponiveis.push(obj);
          }
        });
        return result.outBinds;
      });
  }

  // Extratos
  extratoResumido = (participanteId) => {
    const maxArraySize = defaultMaxArraySize;
    const params = {
      loja: participanteId,
      rownum: maxArraySize,
      nrtc: { dir: this.db.constants.BIND_OUT, type: this.db.constants.NUMBER },
      wrtc: { dir: this.db.constants.BIND_OUT, type: this.db.constants.STRING },
      y: {
        maxArraySize,
        dir: this.db.constants.BIND_OUT,
        type: this.db.constants.STRING,
      },
    };
    const query = `BEGIN ALPE.get_res_extratos_cessoes(
      :loja,
      :rownum,
      :nrtc,
      :wrtc,
      :y);
    END;`;
    return this.cmd
      .executeCommand(query, params, 'extratoResumido')
      .then((result) => {
        result.outBinds.consolidados = [];
        result.outBinds.y.forEach((movimento) => {
          const linha = movimento.split(';');
          if (linha.length >= 10) {
            const obj = {
              tipoOperacao: linha[1],
              bandeira: this.formatter.getBandeiraPortal(linha[2]),
              valorOntem: convertToNumber(linha[3]),
              valorHoje: convertToNumber(linha[4]),
              valorFuturo: convertToNumber(linha[5]),
              valorDisponivel: convertToNumber(linha[6]),
              valorAntecipado: convertToNumber(linha[7]),
              valorCancelado: convertToNumber(linha[8]),
              valorCedido: convertToNumber(linha[9]),
            };
            result.outBinds.consolidados.push(obj);
          }
        });
        return result.outBinds;
      });
  }
  extratoDetalhado = (objFiltro) => {
    const maxArraySize = objFiltro.maxArraySize == null
      ? defaultMaxArraySize
      : objFiltro.maxArraySize;
    const params = {
      loja: objFiltro.participante,
      dt_venda_inicio: convertDate(objFiltro.dataVendaInicial),
      dt_venda_fim: convertDate(objFiltro.dataVendaFinal),
      dt_pagar_inicio: convertDate(objFiltro.dataPagamentoInicial),
      dt_pagar_fim: convertDate(objFiltro.dataPagamentoFinal),
      bandeira: this.formatter.getBandeiraSiscof(objFiltro.idBandeira),
      evento: objFiltro.tipoOperacao,
      id_pos: objFiltro.posId,
      status_transacao: objFiltro.statusTransacao,
      status_pagto: objFiltro.statusPagamento,
      rownum: maxArraySize,
      nrtc: { dir: this.db.constants.BIND_OUT, type: this.db.constants.NUMBER },
      wrtc: { dir: this.db.constants.BIND_OUT, type: this.db.constants.STRING },
      y: {
        maxArraySize,
        dir: this.db.constants.BIND_OUT,
        type: this.db.constants.STRING,
      },
    };
    const query = `BEGIN ALPE.get_extratos_cessoes(
      :loja,
      TRUNC(CAST(:dt_venda_inicio AS DATE)),
      TRUNC(CAST(:dt_venda_fim AS DATE)),
      TRUNC(CAST(:dt_pagar_inicio AS DATE)),
      TRUNC(CAST(:dt_pagar_fim AS DATE)),
      :bandeira,
      :evento,
      :id_pos,
      :status_transacao,
      :status_pagto,
      :rownum,
      :nrtc,
      :wrtc,
      :y);
    END;`;
    return this.cmd
      .executeCommand(query, params, 'extratoDetalhado')
      .then((result) => {
        result.outBinds.movimentos = [];
        result.outBinds.y.forEach((movimento) => {
          const linha = movimento.split(';');
          if (linha.length >= 16) {
            const obj = {
              operacao: linha[0], // Evento
              dataVenda: convertDate(linha[1]), // data da venda
              dataPagamento: convertDate(linha[2]), // data a pagar EC
              statusTransacao: linha[3], // status da transacao
              statusPagamento: linha[4], // status do pagamento
              bandeira: this.formatter.getBandeiraPortal(linha[6]), // bandeira
              valorVenda: convertToNumber(linha[8]), // valor venda
              valorReceber: convertToNumber(linha[9]), // valor a receber
              valorDesconto: convertToNumber(linha[10]), //
              idPos: linha[11], // Id POS
              idAutorizacao: linha[12], // Autorizacao
              nsu: linha[13], // NSU
              nsuOriginal: linha[14], // NSU Original
              cartao: linha[15], // cartao
            };
            result.outBinds.movimentos.push(obj);
          }
        });

        return result.outBinds;
      });
  }
}

export default SiscofConnectorProd;
