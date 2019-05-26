const jwt = require('jsonwebtoken');
const Maestro = require('maestro-io');

const di = new Maestro(__dirname);

di.loadDirs('controllers', 'model', 'services', 'environment/mailer')
  .loadFiles(
    'environment/auth',
    'environment/db',
    'environment/server',
    'environment/validator',
    'environment/logger',
    'app-dev-seed',
    'environment/siscof/siscof-wrapper',
    'environment/siscof/siscof-connector',
    'environment/siscof/siscof-formatter',
    'environment/siscof/siscof-cmd',
    // 'environment/siscof/siscof-db',
  )

  // ############ FAKE ENVIRONMENT ARTIFACTS ############
  .provide('@db-settings', () => {
    const user = process.argv[2] || 'sa@localhost:5432/alpe';
    const config = {
      mainDb: {
        connection: `postgres://postgres:${user}`,
        // logging: (...args) => console.log(args[0]),
      },
    };
    return Promise.resolve(config);
  })

  // ############ FAKE SISCOF ############
  .provide('$siscof-db', () => {
    const db = {
      constants: {
        // Tipos OutFormat
        ARRAY: 4001,
        OBJECT: 4002,
        // Tipos Oracle-Node
        BLOB: 2007,
        BUFFER: 2005,
        CLOB: 2006,
        CURSOR: 2004,
        DATE: 2003,
        DEFAULT: 0,
        NUMBER: 2002,
        STRING: 2001,
        // Tipos Bind
        BIND_IN: 3001,
        BIND_INOUT: 3002,
        BIND_OUT: 3003,
      },
      connectByPool: () => {
        const obj = {
          execute: (query, params) => {
            console.log('SISCOF-DB: execute', query.replace(/\s/g, ''));
            console.log('SISCOF-DB: params', params);
            return Promise.resolve({
              outBinds: {
                nrtc: 0,
                wrtc: 0,
                wmsg: '',
              },
            });
          },
          close: () => Promise.resolve(),
        };
        return Promise.resolve(obj);
      },
    };
    return Promise.resolve(db);
  })
  .init('$siscof-connector', (siscofConnector) => {
    siscofConnector.consultarTarifaCessionario = (fornecedorId) => {
      console.log('SISCOF: consultarTarifaCessionario', fornecedorId);
      return Promise.resolve({
        nrtc: 0,
        taxas: [
          {
            sequencia: 1,
            valorInicio: 0,
            valorFim: 1000,
            taxaCessao: 2.5,
          },
          {
            sequencia: 2,
            valorInicio: 1000,
            valorFim: 99999,
            taxaCessao: 1.5,
          },
        ],
        taxaAntecipacao: 1.5,
      });
    };

    siscofConnector.solicitarCessao = (objCessao) => {
      console.log('SISCOF: solicitarCessao', objCessao);
      // Parametros esperados de entrada
      // cessao.participanteVinculo.participanteFornecedorId,
      // cessao.participanteVinculo.participanteEstabelecimentoId,
      //  _convertDate(cessao.dataVencimento),
      // cessao.valorSolicitado,
      // cessao.diluicaoPagamento,
      return Promise.resolve({
        nrtc: 0,
        wrtc: 'mensagem',
        recebiveis: [],
      });
    };

    siscofConnector.solicitarCessaoParcelada = (objCessao) => {
      // Parametros esperados de entrada
      // cessao.participanteVinculo.participanteFornecedorId,
      // cessao.participanteVinculo.participanteEstabelecimentoId,
      //  _convertDate(cessao.dataVencimento),
      // cessao.valorSolicitado,
      // cessao.diluicaoPagamento,
      // cessao.numeroParcelas,
      // cessao.valorParcelas, Array com o valor das parcelas[50,50,50]
      console.log('SISCOF: solicitarCessaoParcelada', objCessao);
      return Promise.resolve({
        nrtc: 0,
        wrtc: 'mensagem',
        recebiveis: [
          {
            statusPagamento: 1,
            eventoId: 2,
            dataVenda: new Date('2018-09-20'),
            valorVenda: 10,
            dataReserva: new Date('2018-09-30'),
            dataPagarEc: new Date('2018-10-03T00:00:00.000Z'),
            valorPagarEc: 10,
            nsu: 'AAAFOnAAAAAABpNAAE',
            numeroParcela: '1',
            totalParcelas: '1',
            numeroParcelaCessao: '1',
          },
          {
            statusPagamento: 1,
            eventoId: 2,
            dataVenda: new Date('2018-09-20'),
            valorVenda: 10,
            dataReserva: new Date('2018-09-30'),
            dataPagarEc: new Date('2018-10-03T00:00:00.000Z'),
            valorPagarEc: 10,
            nsu: 'AAAFOnAAAAAABpNAAE',
            numeroParcela: '1',
            totalParcelas: '1',
            numeroParcelaCessao: '2',
          },
          {
            statusPagamento: 1,
            eventoId: 123,
            dataVenda: new Date('2018-09-20'),
            valorVenda: -0.3,
            dataReserva: new Date('2018-09-30'),
            dataPagarEc: new Date('2018-10-03T00:00:00.000Z'),
            valorPagarEc: -0.3,
            nsu: 'AAAFOnAAAAAABpNAAE',
            numeroParcela: '1',
            totalParcelas: '1',
            numeroParcelaCessao: '1',
          },
        ],
      });
    };

    siscofConnector.listarCessoes = (objCessao) => {
      console.log('SISCOF: listarCessoes', objCessao);
      return Promise.resolve({
        wrtc: 0,
        recebiveis: [
          {
            statusPagamento: 1,
            eventoId: 123,
            dataVenda: new Date('2018-09-20'),
            valorVenda: -0.3,
            dataReserva: new Date('2018-09-30'),
            dataPagarEc: new Date('2018-10-03T00:00:00.000Z'),
            valorPagarEc: -0.3,
            nsu: 'AAAFOnAAAAAABpNAAE',
            numeroParcela: '1',
            totalParcelas: '1',
          },
          {
            statusPagamento: 1,
            eventoId: 2,
            dataVenda: new Date('2018-09-20'),
            valorVenda: 2,
            dataReserva: new Date('2018-09-21'),
            dataPagarEc: new Date('2018-10-03T00:00:00.000Z'),
            valorPagarEc: 1.3,
            nsu: 'AAAFOnAAAAAABpNAAF',
            numeroParcela: '1',
            totalParcelas: '1',
          },
          {
            statusPagamento: 1,
            eventoId: 3,
            dataVenda: new Date('2018-09-20'),
            valorVenda: 5.6,
            dataReserva: new Date('2018-09-21'),
            dataPagarEc: new Date('2018-10-03T00:00:00.000Z'),
            valorPagarEc: 5,
            nsu: 'AAAFOnAAAAAABpNAAG',
            numeroParcela: '1',
            totalParcelas: '1',
          },
          {
            statusPagamento: 1,
            eventoId: 3,
            dataVenda: new Date('2018-09-20'),
            valorVenda: 4.5,
            dataReserva: new Date('2018-09-21'),
            dataPagarEc: new Date('2018-10-03T00:00:00.000Z'),
            valorPagarEc: 4,
            nsu: 'AAAFOnAAAAAABpNAAH',
            numeroParcela: '1',
            totalParcelas: '1',
          },
        ],
      });
    };

    siscofConnector.listarCessoesDetalhe = (objCessao) => {
      console.log('SISCOF: listarCessoesDetalhe', objCessao);
      return Promise.resolve({
        wrtc: 0,
        recebiveis: [
          {
            statusPagamento: 1,
            eventoId: 123,
            dataVenda: new Date('2018-09-20'),
            valorVenda: -0.3,
            dataReserva: new Date('2018-09-30'),
            dataPagarEc: new Date('2018-10-03T00:00:00.000Z'),
            valorPagarEc: -0.3,
            nsu: 'AAAFOnAAAAAABpNAAE',
            numeroParcela: '1',
            totalParcelas: '1',
            bandeira: 1,
            numeroParcelaCessao: '1',
          },
          {
            statusPagamento: 1,
            eventoId: 2,
            dataVenda: new Date('2018-09-20'),
            valorVenda: 5.45,
            dataReserva: new Date('2018-09-21'),
            dataPagarEc: new Date('2018-10-03T00:00:00.000Z'),
            valorPagarEc: 1.3,
            nsu: 'AAAFOnAAAAAABpNAAF',
            numeroParcela: '1',
            totalParcelas: '1',
            bandeira: 4,
            numeroParcelaCessao: '1',
          },
          {
            statusPagamento: 1,
            eventoId: 3,
            dataVenda: new Date('2018-09-20'),
            valorVenda: 3.9,
            dataReserva: new Date('2018-09-21'),
            dataPagarEc: new Date('2018-10-03T00:00:00.000Z'),
            valorPagarEc: 5,
            nsu: 'AAAFOnAAAAAABpNAAG',
            numeroParcela: '1',
            totalParcelas: '1',
            bandeira: 2,
            numeroParcelaCessao: '1',
          },
          {
            statusPagamento: 1,
            eventoId: 3,
            dataVenda: new Date('2018-09-20'),
            valorVenda: 1.25,
            dataReserva: new Date('2018-09-21'),
            dataPagarEc: new Date('2018-10-03T00:00:00.000Z'),
            valorPagarEc: 4,
            nsu: 'AAAFOnAAAAAABpNAAH',
            numeroParcela: '1',
            totalParcelas: '1',
            bandeira: 3,
            numeroParcelaCessao: '1',
          },
        ],
      });
    };

    siscofConnector.consultarValorDisponivelCessao = (objCessao) => {
      console.log('SISCOF: consultarValorDisponivelCessao', objCessao);
      return Promise.resolve({
        nrtc: 0,
        nValor: parseFloat((Math.random() * 100000 + 10000).toFixed(2)),
      });
    };

    siscofConnector.consultarValorDisponivelCessaoParcelada = (objCessao) => {
      console.log('SISCOF: consultarValorDisponivelCessaoParcelada', objCessao);
      return Promise.resolve({
        nrtc: 0,
        disponiveis: [
          {
            periodo: 1,
            valor: 1500.0,
          },
          {
            periodo: 2,
            valor: 1500.0,
          },
          {
            periodo: 3,
            valor: 900.0,
          },
          {
            periodo: 4,
            valor: 1500.0,
          },
          {
            periodo: 5,
            valor: 1500.0,
          },
          {
            periodo: 6,
            valor: 1500.0,
          },
        ],
      });
    };

    siscofConnector.listarMovimentosParaAntecipar = (objFiltro) => {
      console.log('SISCOF: listarMovimentosParaAntecipar', objFiltro);
      return Promise.resolve({
        wrtc: 0,
        movimentos: [
          {
            dataVenda: new Date(2018, 11, 29),
            valorVenda: 500.00,
            dataAntecipacao: new Date(2018, 9, 21),
            dataPagamento: new Date(2018, 12, 29),
            diasAntecipacao: 8,
            valorPagar: 492.50,
            taxaAntecipacao: 1.8,
            descontoAntecipacao: 8.78,
            valorAntecipado: 483.64,
            bandeiraId: 2,
            eventoId: 3,
            parcelaAtual: 1,
            qtdeParcelas: 3,
            rowId: 'AAAFOnAAAAAAAx6AAO',
            valorParcela: 500.00,
            valorDescontoMdr: 7.50,
            nsu: '12233445533',
          },
          {
            dataVenda: new Date(2018, 12, 6),
            valorVenda: 2910.00,
            dataAntecipacao: new Date(2018, 12, 6),
            dataPagamento: new Date(2019, 1, 5),
            diasAntecipacao: 12,
            valorPagar: 970.00,
            taxaAntecipacao: 2.0,
            descontoAntecipacao: 19.40,
            valorAntecipado: 950.60,
            bandeiraId: 1,
            eventoId: 3,
            parcelaAtual: 1,
            qtdeParcelas: 3,
            rowId: 'BBBFOnBBBBBBBx6BBO',
            valorParcela: 989.40,
            valorDescontoMdr: 19.40,
            nsu: '12233445533',
          },
          {
            dataVenda: new Date(2018, 12, 6),
            valorVenda: 200.00,
            dataAntecipacao: new Date(2018, 9, 10),
            dataPagamento: new Date(2019, 1, 5),
            diasAntecipacao: 14,
            valorPagar: 66.66,
            taxaAntecipacao: 2.0,
            descontoAntecipacao: 1.33,
            valorAntecipado: 65.33,
            bandeiraId: 2,
            eventoId: 3,
            parcelaAtual: 1,
            qtdeParcelas: 3,
            rowId: 'CCCFOnCCCCCCCx6CCO',
            valorParcela: 68.16,
            valorDescontoMdr: 1.50,
            nsu: '12233445533',
          },
          {
            dataVenda: new Date(2018, 12, 3),
            valorVenda: 350.00,
            dataAntecipacao: new Date(2018, 9, 17),
            dataPagamento: new Date(2019, 1, 2),
            diasAntecipacao: 16,
            valorPagar: 116.66,
            taxaAntecipacao: 1.8,
            descontoAntecipacao: 2.10,
            valorAntecipado: 114.56,
            bandeiraId: 1,
            eventoId: 3,
            parcelaAtual: 1,
            qtdeParcelas: 3,
            rowId: 'DDDFOnDDDDDDDx6DDO',
            valorParcela: 118.66,
            valorDescontoMdr: 2.00,
            nsu: '12233445533',
          },
        ],
      });
    };

    siscofConnector.consultarAntecipacaoRealizada = (objFiltro) => {
      console.log('SISCOF: consultarAntecipacaoRealizada', objFiltro);
      return Promise.resolve({
        wrtc: 0,
        movimentos: [
          {
            dataVenda: new Date(2018, 11, 29),
            valorVenda: 500.00,
            dataAntecipacao: new Date(2018, 9, 21),
            dataPagamento: new Date(2018, 12, 29),
            diasAntecipacao: 8,
            valorPagar: 492.50,
            taxaAntecipacao: 1.8,
            descontoAntecipacao: 8.78,
            valorAntecipado: 483.64,
            bandeiraId: 2,
            eventoId: 3,
            parcelaAtual: 1,
            qtdeParcelas: 3,
            rowId: 'AAAFOnAAAAAAAx6AAO',
            valorParcela: 500.00,
            valorDescontoMdr: 7.50,
            nsu: '12233445533',

            codigo: 200,
            domicilioBancario: 'TESTES',
            valorSolicitado: 10.30,
            nsuOriginal: '23312114344',
            dataPagarLojaOriginal: new Date(2018, 11, 6),
          },
          {
            dataVenda: new Date(2018, 11, 29),
            valorVenda: 500.00,
            dataAntecipacao: new Date(2018, 9, 21),
            dataPagamento: new Date(2018, 12, 29),
            diasAntecipacao: 8,
            valorPagar: 492.50,
            taxaAntecipacao: 1.8,
            descontoAntecipacao: 8.78,
            valorAntecipado: 483.64,
            bandeiraId: 2,
            eventoId: 3,
            parcelaAtual: 1,
            qtdeParcelas: 3,
            rowId: 'AAAFOnAAAAAAAx6AAO',
            valorParcela: 500.00,
            valorDescontoMdr: 7.50,
            nsu: '12233445533',

            codigo: 200,
            domicilioBancario: 'TESTES2',
            valorSolicitado: 10.30,
            nsuOriginal: '23312114344',
            dataPagarLojaOriginal: new Date(2018, 12, 3),

          },
          {
            dataVenda: new Date(2018, 12, 6),
            valorVenda: 200.00,
            dataAntecipacao: new Date(2018, 9, 10),
            dataPagamento: new Date(2019, 1, 5),
            diasAntecipacao: 14,
            valorPagar: 66.66,
            taxaAntecipacao: 2.0,
            descontoAntecipacao: 1.33,
            valorAntecipado: 65.33,
            bandeiraId: 2,
            eventoId: 3,
            parcelaAtual: 1,
            qtdeParcelas: 3,
            rowId: 'CCCFOnCCCCCCCx6CCO',
            valorParcela: 68.16,
            valorDescontoMdr: 1.50,
            nsu: '12233445533',

            codigo: 200,
            domicilioBancario: 'TESTES',
            valorSolicitado: 10.30,
            nsuOriginal: '23312114344',
            dataPagarLojaOriginal: new Date(2018, 12, 3),
          },
          {
            dataVenda: new Date(2018, 12, 3),
            valorVenda: 350.00,
            dataAntecipacao: new Date(2018, 9, 17),
            dataPagamento: new Date(2019, 1, 2),
            diasAntecipacao: 16,
            valorPagar: 116.66,
            taxaAntecipacao: 1.8,
            descontoAntecipacao: 2.10,
            valorAntecipado: 114.56,
            bandeiraId: 1,
            eventoId: 3,
            parcelaAtual: 1,
            qtdeParcelas: 3,
            rowId: 'DDDFOnDDDDDDDx6DDO',
            valorParcela: 118.66,
            valorDescontoMdr: 2.00,
            nsu: '12233445533',

            codigo: 200,
            domicilioBancario: 'TESTES',
            valorSolicitado: 10.30,
            nsuOriginal: '23312114344',
            dataPagarLojaOriginal: new Date(2018, 12, 3),

          },
        ],
      });
    };

    siscofConnector.efetivarAntecipacao = (objAntecipacoes) => {
      console.log('SISCOF: efetivarAntecipacao', objAntecipacoes);
      return Promise.resolve({
        wrtc: 0,
        movimentos: [
          {
            dataVenda: new Date(2018, 9, 1),
            valorVenda: 207,
            dataAntecipacao: new Date(2018, 9, 21),
            dataPagamento: new Date(2018, 9, 24),
            diasAntecipacao: 2,
            valorPagar: 97,
            taxaAntecipacao: 2.4,
            descontoAntecipacao: 5,
            valorAntecipado: 21,
            bandeira: 3,
            evento: 1,
            parcelaAtual: 1,
            qtdeParcelas: 6,
            rowId: 'AAAFOnAAAAAAAx6AAO',
            nsu: '12233445533',
          },
          {
            dataVenda: new Date(2018, 7, 29),
            valorVenda: 342,
            dataAntecipacao: new Date(2018, 8, 7),
            dataPagamento: new Date(2018, 8, 9),
            diasAntecipacao: 3,
            valorPagar: 164,
            taxaAntecipacao: 3.1,
            descontoAntecipacao: 20,
            valorAntecipado: 55,
            bandeira: 1,
            evento: 2,
            parcelaAtual: 2,
            qtdeParcelas: 3,
            rowId: 'BBBFOnBBBBBBBx6BBO',
            nsu: '12233445533',
          },
        ],
      });
    };

    siscofConnector.extratoDetalhado = (objFiltro) => {
      console.log('SISCOF: extratoDetalhado', objFiltro);
      return Promise.resolve({
        nrtc: 0,
        movimentos: [
          {
            dataVenda: new Date('2018-09-20'),
            dataPagamento: new Date('2018-10-20'),
            statusTransacao: 'Aprovada',
            statusPagamento: 'Pago',
            bandeira: 'Mastercard',
            operacao: 'Crédito a vista',
            valorVenda: 43,
            valorDesconto: 0.2,
            valorReceber: 0.3,
            idPos: '12345',
            idAutorizacao: '000000011111',
            nsu: 'AAAFOnAAAAAABpNAAE',
            nsuOriginal: 'AAAFOnAAAAAABpNAAF',
            cartao: '000111111XXXXXX1111',
          },
          {
            dataVenda: '2018-04-01',
            dataPagamento: '2018-05-12',
            statusTransacao: 'Aprovada',
            statusPagamento: 'Pago',
            bandeira: 'MASTERCARD',
            operacao: 'Transacao Credito à Vista',
            valorVenda: 43,
            valorDesconto: 0.2,
            valorReceber: 0.2,
            idPos: '',
            idAutorizacao: '000000011111',
            nsu: '1',
            nsuOriginal: '',
            cartao: '000111111XXXXXX1111',
          },
          {
            dataVenda: '2018-04-25',
            dataPagamento: '2018-05-19',
            statusTransacao: 'Aprovada',
            statusPagamento: 'Pendente',
            bandeira: 'MASTERCARD',
            operacao: 'Transacao Credito à  Vista',
            valorVenda: 22,
            valorDesconto: 0.9,
            valorReceber: 0.7,
            idPos: '',
            idAutorizacao: '000000022222',
            nsu: '2',
            nsuOriginal: '',
            cartao: '000222222XXXXXX2222',
          },
          {
            dataVenda: '2018-03-28',
            dataPagamento: '2018-04-30',
            statusTransacao: 'Aprovada',
            statusPagamento: 'Pendente',
            bandeira: 'VISA',
            operacao: 'Transacao Parcelado 2 a 6',
            valorVenda: 4,
            valorDesconto: 0.2,
            valorReceber: 2.1,
            idPos: 'GW033D33',
            idAutorizacao: '000000033333',
            nsu: '3',
            nsuOriginal: '',
            cartao: '000333333XXXXXX3333',
          },
          {
            dataVenda: '2018-06-02',
            dataPagamento: '2018-09-21',
            statusTransacao: 'Aprovada',
            statusPagamento: 'Pendente',
            bandeira: 'VISA',
            operacao: 'Transacao Parcelado 7 a 12',
            valorVenda: 1,
            valorDesconto: 0.1,
            valorReceber: 0.6,
            idPos: 'GW044D44',
            authorizationId: '000000044444',
            nsu: '4',
            nsuOriginal: '',
            cartao: '000444444XXXXXX4444',
          },
        ],
      });
    };

    siscofConnector.extratoResumido = (participanteId) => {
      console.log('SISCOF: extratoResumido', participanteId);
      return Promise.resolve({
        nrtc: 0,
        consolidados: [
          {
            tipoOperacao: 'Transacao de Debito',
            bandeira: 'MASTERCARD',
            valorOntem: 17.09,
            valorHoje: 239.72,
            valorFuturo: 52.12,
            valorDisponivel: 188.42,
            valorAntecipado: 512.1,
            valorCancelado: 9.03,
            valorCedido: 2.91,
          },
          {
            tipoOperacao: 'Crédito à vista',
            bandeira: 'MASTERCARD',
            valorOntem: 12.09,
            valorHoje: 345.72,
            valorFuturo: 123.12,
            valorDisponivel: 12.42,
            valorAntecipado: 53.1,
            valorCancelado: 12.03,
            valorCedido: 1222.91,
          },
          {
            tipoOperacao: 'Crédito 2 a 6',
            bandeira: 'MASTERCARD',
            valorOntem: 17.09,
            valorHoje: 239.72,
            valorFuturo: 235.12,
            valorDisponivel: 123.42,
            valorAntecipado: 512.1,
            valorCancelado: 456.03,
            valorCedido: 355.91,
          },
        ],
      });
    };

    siscofConnector.getAntecipacoesConsolidado = () => {
      console.log('SISCOF: get_antecipacoes_consolidado');
      return Promise.resolve({
        wrtc: 0,
        antecipacoes: [
          {
            codigoAntecipacao: 1,
            dataSolicitacao: '2019-01-31',
            valorSolicitado: 100,
            valorDescontoAntecipacao: 2,
            valorAntecipado: 98,
          },
          {
            codigoAntecipacao: 2,
            dataSolicitacao: '2019-02-01',
            valorSolicitado: 88,
            valorDescontoAntecipacao: 1.76,
            valorAntecipado: 86.24,
          },
          {
            codigoAntecipacao: 3,
            dataSolicitacao: '2019-02-04',
            valorSolicitado: 50,
            valorDescontoAntecipacao: 1,
            valorAntecipado: 49,
          },
          {
            codigoAntecipacao: 4,
            dataSolicitacao: '2019-02-05',
            valorSolicitado: 45,
            valorDescontoAntecipacao: 8.87,
            valorAntecipado: 36.13,
          },
        ],
      });
    };

    siscofConnector.getCessoesRealizadas = () => {
      console.log('SISCOF: get_cessoes_realizadas');
      return Promise.resolve({
        wrtc: 0,
        cessoes: [
          {
            codigoCessao: 1,
            codigoLoja: 1,
            nomeFantasia: 'Super Mercado Shows',
            cnpj: '64242235000172',
            dataSolicitacao: '2019-02-05',
            valor: 20.75,
          },
          {
            codigoCessao: 2,
            codigoLoja: 1,
            nomeFantasia: 'Super Mercado Shows',
            cnpj: '64242235000172',
            dataSolicitacao: '2019-02-07',
            valor: 179.26,
          },
          {
            codigoCessao: 3,
            codigoLoja: 1,
            nomeFantasia: 'Super Mercado Shows',
            cnpj: '64242235000172',
            dataSolicitacao: '2019-02-08',
            valor: 600,
          },
          {
            codigoCessao: 4,
            codigoLoja: 2,
            nomeFantasia: 'Super Mario Mercado Bros',
            cnpj: '30555033000169',
            dataSolicitacao: '2019-02-05',
            valor: 1207.2,
          },
          {
            codigoCessao: 5,
            codigoLoja: 2,
            nomeFantasia: 'Super Mario Mercado Bros',
            cnpj: '30555033000169',
            dataSolicitacao: '2019-02-07',
            valor: 378.40,
          },
          {
            codigoCessao: 6,
            codigoLoja: 3,
            nomeFantasia: 'Super Tres Compras',
            cnpj: '98832780000130',
            dataSolicitacao: '2019-02-05',
            valor: 5984,
          },
        ],
      });
    };

    siscofConnector.obterRelatorioRemessaVendas = (
      participanteId,
      dataInicioOperacao,
      dataFimOperacao
    ) => {
      console.log('SISCOF: obterRelatorioRemessaVendas',
        participanteId, dataInicioOperacao, dataFimOperacao);
      return Promise.resolve({
        /* eslint-disable max-len */
        csv: `Data;NSU;Autorizacao;Valor;Plano;Rede;Bandeira;Loja;Estabelecimento;Cliente;Caixa
        20180823;13417110194;205433;1668,00;6;GLOBAL;VISA;110194;0;AAADqEAAAAAAC6CAAA;GW016107
        20180810;4017110194;243965;363,18;4;GLOBAL;MASTERCARD;110194;0;AAADqEAAAAAAC6CAAB;GW016108
        20180904;24117110194;080927;180,00;3;GLOBAL;HIPERCARD;110194;0;AAADqEAAAAAAC6CAAC;GW016108
        20180904;24117110194;080927;180,00;3;GLOBAL;HIPERCARD;110194;0;AAADqEAAAAAAC6CAAD;GW016108
        20180904;24117110194;080927;180,00;3;GLOBAL;HIPERCARD;110194;0;AAADqEAAAAAAC6CAAE;GW016108
        20180904;24317110194;000403;99,20;2;GLOBAL;HIPERCARD;110194;0;AAADqEAAAAAAC6CAAF;GW016108
        20180904;24317110194;000403;99,20;2;GLOBAL;HIPERCARD;110194;0;AAADqEAAAAAAC6CAAG;GW016108
        20180904;31217110194;052972;640,00;6;GLOBAL;VISA;110194;0;AAADqEAAAAAAC6CAAH;GW016109
        20180904;31217110194;052972;640,00;6;GLOBAL;VISA;110194;0;AAADqEAAAAAAC6CAAI;GW016109
        20180904;31217110194;052972;640,00;6;GLOBAL;VISA;110194;0;AAADqEAAAAAAC6CAAJ;GW016109`,
        /* eslint-disable max-len */
      });
    };

    siscofConnector.obterRelatorioRegistroVendasDetalhe = (
      participanteId,
      dataInicioOperacao,
      dataFimOperacao
    ) => {
      console.log('SISCOF: obterRelatorioRegistroVendasDetalhe',
        participanteId, dataInicioOperacao, dataFimOperacao);
      return Promise.resolve({
        /* eslint-disable max-len */
        csv: `Data da venda;Data de crédito;NSU;Autorização;Plano;Parcela;Rede;Bandeira;Produto;Valor venda;Taxa administração;Número do lote;Área cliente;Banco;Agência;Conta;Código loja;Loja;Código do Estabelecimento;Número cartão;Valor líquido;Valor Bruto;Modo de Captura;Status;Reservado
        20180823;20181024;13417110194;205433;6;2;GLOBAL;VISA;C;166800;300;0;AAADqEAAAAAAC6CAAA;246;1;1;110194;Teste Vinculo Cessão;0;000421965XXXXXX7529;26966;27800;POS;02;
        20180810;20181011;4017110194;243965;4;2;GLOBAL;MASTERCARD;C;36318;300;0;AAADqEAAAAAAC6CAAB;246;1;1;110194;Teste Vinculo Cessão;0;000515590XXXXXX8700;8807;9079;POS;02;
        20180904;20181008;24117110194;080927;3;1;GLOBAL;HIPERCARD;C;18000;300;0;AAADqEAAAAAAC6CAAC;246;1;1;110194;Teste Vinculo Cessão;0;000606282XXXXXX8935;5820;6000;POS;02;
        20180904;20181107;24117110194;080927;3;2;GLOBAL;HIPERCARD;C;18000;300;0;AAADqEAAAAAAC6CAAD;246;1;1;110194;Teste Vinculo Cessão;0;000606282XXXXXX8935;5820;6000;POS;02;
        20180904;20181205;24117110194;080927;3;3;GLOBAL;HIPERCARD;C;18000;300;0;AAADqEAAAAAAC6CAAE;246;1;1;110194;Teste Vinculo Cessão;0;000606282XXXXXX8935;5820;6000;POS;02;
        20180904;20181008;24317110194;000403;2;1;GLOBAL;HIPERCARD;C;9920;300;0;AAADqEAAAAAAC6CAAF;246;1;1;110194;Teste Vinculo Cessão;0;000606282XXXXXX7164;4811;4960;POS;02;
        20180904;20181107;24317110194;000403;2;2;GLOBAL;HIPERCARD;C;9920;300;0;AAADqEAAAAAAC6CAAG;246;1;1;110194;Teste Vinculo Cessão;0;000606282XXXXXX7164;4811;4960;POS;02;
        20180904;20181008;31217110194;052972;6;1;GLOBAL;VISA;C;64000;300;0;AAADqEAAAAAAC6CAAH;246;1;1;110194;Teste Vinculo Cessão;0;000439354XXXXXX1802;10350;10670;POS;02;
        20180904;20181107;31217110194;052972;6;2;GLOBAL;VISA;C;64000;300;0;AAADqEAAAAAAC6CAAI;246;1;1;110194;Teste Vinculo Cessão;0;000439354XXXXXX1802;10346;10666;POS;02;
        20180904;20181205;31217110194;052972;6;3;GLOBAL;VISA;C;64000;300;0;AAADqEAAAAAAC6CAAJ;246;1;1;110194;Teste Vinculo Cessão;0;000439354XXXXXX1802;10346;10666;POS;02;`,
        /* eslint-disable max-len */
      });
    };

    siscofConnector.obterRelatorioRegistroVendasResumo = (
      participanteId,
      dataInicioOperacao,
      dataFimOperacao
    ) => {
      console.log('SISCOF: obterRelatorioRegistroVendasResumo',
        participanteId, dataInicioOperacao, dataFimOperacao);
      return Promise.resolve({
        /* eslint-disable max-len */
        csv: `Data da venda;Data de crédito;NSU;Autorização;Plano;Rede;Bandeira;Produto;Valor venda;Taxa administração;Número do lote;Área cliente;Banco;Agência;Conta;Código loja;Loja;Código do Estabelecimento;Número cartão;Valor líquido;Valor Bruto;Modo de Captura;Status;Reservado
        20180908;20181010;36317110194;484645;3;GLOBAL;VISA;C;16000;300;0;AAADqEAAAAAAC62AAI;246;1;1;110194;Teste Vinculo Cessão;0;000441524XXXXXX0226;5174;5334;POS;02;
        20180908;20181010;36217110194;413151;6;GLOBAL;VISA;C;36000;300;0;AAADqEAAAAAAC6uAAI;246;1;1;110194;Teste Vinculo Cessão;0;000422061XXXXXX4144;5820;6000;POS;02;
        20180906;20181010;33817110194;631192;6;GLOBAL;VISA;C;48000;300;0;AAADqEAAAAAAC61AAJ;246;1;1;110194;Teste Vinculo Cessão;0;000453211XXXXXX6960;7760;8000;POS;02;
        20180906;20181010;33317110194;066477;2;GLOBAL;VISA;C;10000;300;0;AAADqEAAAAAAC6KAAC;246;1;1;110194;Teste Vinculo Cessão;0;000400437XXXXXX7214;4850;5000;POS;02;
        20180906;20181010;22817110194;036961;3;GLOBAL;HIPERCARD;C;18790;300;0;AAADqEAAAAAAC6VAAA;246;1;1;110194;Teste Vinculo Cessão;0;000606282XXXXXX4173;6076;6264;POS;02;
        20180906;20181010;33017110194;027212;4;GLOBAL;MASTERCARD;C;22000;300;0;AAADqEAAAAAAC6ZAAH;246;1;1;110194;Teste Vinculo Cessão;0;000530994XXXXXX7869;5335;5500;POS;02;
        20180906;20181010;34017110194;002328;3;GLOBAL;ELO;C;41087;300;0;AAADqEAAAAAAC6dAAK;246;1;1;110194;Teste Vinculo Cessão;0;000506775XXXXXX5666;13286;13697;POS;02;
        20180905;20181008;22017110194;X2MPR2;2;GLOBAL;MASTERCARD;C;13041;300;0;AAADqEAAAAAAC6DAAI;246;1;1;110194;Teste Vinculo Cessão;0;000523421XXXXXX3941;6325;6521;POS;02;
        20180905;20181008;31417110194;082610;3;GLOBAL;VISA;C;18352;300;0;AAADqEAAAAAAC6lAAA;246;1;1;110194;Teste Vinculo Cessão;0;000467148XXXXXX8922;5934;6118;POS;02;
        20180905;20181008;22517110194;080332;4;GLOBAL;MASTERCARD;C;23015;300;0;AAADqEAAAAAAC6XAAI;246;1;1;110194;Teste Vinculo Cessão;0;000548724XXXXXX0996;5583;5756;POS;02;`,
        /* eslint-disable max-len */
      });
    };

    siscofConnector.obterRelatorioPagamentos = (
      participanteId,
      dataInicioOperacao,
      dataFimOperacao
    ) => {
      console.log('SISCOF: obterRelatorioPagamentos',
        participanteId, dataInicioOperacao, dataFimOperacao);
      return Promise.resolve({
        /* eslint-disable max-len */
        csv: `Data da venda;Data de crédito;NSU;Autorização;Plano;Parcela;Rede;Bandeira;Produto;Valor bruto;Valor venda;Valor administração;Valor antecipação;Número do lote;Área cliente;Banco;Agência;Conta;Código loja;Loja;Código do Estabelecimento;Status;Valor líquido;Modo de Captura;Reservado
        20190114;20190114;20190103201512780;1;1;1;GLOBAL;;C;8155;8155;0;;0;AAADqEAAAAAAC7bAAR;246;1;1;110194;Teste Vinculo Cessão;0;;8155;POS;
        20180827;20180928;3317110194;244053;1;1;GLOBAL;VISA;C;7341;7341;184;;0;AAADqEAAAAAAC6+AAO;246;1;1;110194;Teste Vinculo Cessão;0;PAG;7157;POS;
        20180827;20180928;18817110194;003559;1;1;GLOBAL;VISA;C;4771;4771;119;;0;AAADqEAAAAAAC6+AAN;246;1;1;110194;Teste Vinculo Cessão;0;PAG;4652;POS;
        20180901;20181105;19917110194;029435;2;2;GLOBAL;ELO;C;5500;11000;165;;0;AAADqEAAAAAAC6+AAM;246;1;1;110194;Teste Vinculo Cessão;0;PAG;5335;POS;
        20180829;20181001;20917110194;UGY4W5;3;1;GLOBAL;MASTERCARD;C;5117;15351;154;;0;AAADqEAAAAAAC6+AAL;246;1;1;110194;Teste Vinculo Cessão;0;PAG;4963;POS;
        20180830;20181003;27617110194;059353;1;1;GLOBAL;VISA;C;7000;7000;175;;0;AAADqEAAAAAAC6+AAK;246;1;1;110194;Teste Vinculo Cessão;0;PAG;6825;POS;
        20180827;20181029;19017110194;082679;6;2;GLOBAL;MASTERCARD;C;13826;82959;415;;0;AAADqEAAAAAAC6+AAJ;246;1;1;110194;Teste Vinculo Cessão;0;PAG;13411;POS;
        20180817;20181018;11617110194;089650;2;2;GLOBAL;HIPERCARD;C;14100;28200;423;;0;AAADqEAAAAAAC6+AAI;246;1;1;110194;Teste Vinculo Cessão;0;PAG;13677;POS;
        20180817;20181219;16517110194;052038;4;4;GLOBAL;VISA;C;5250;21000;158;;0;AAADqEAAAAAAC6+AAH;246;1;1;110194;Teste Vinculo Cessão;0;PAG;5092;POS;
        20180817;20181119;16517110194;052038;4;3;GLOBAL;VISA;C;5250;21000;158;;0;AAADqEAAAAAAC6+AAG;246;1;1;110194;Teste Vinculo Cessão;0;PAG;5092;POS;`,
        /* eslint-disable max-len */
      });
    };

    siscofConnector.obterRelatorioAjustesTarifas = (
      participanteId,
      dataInicioOperacao,
      dataFimOperacao
    ) => {
      console.log('SISCOF: obterRelatorioAjustesTarifas',
        participanteId, dataInicioOperacao, dataFimOperacao);
      return Promise.resolve({
        /* eslint-disable max-len */
        csv: `Data de crédito / débito;Data da venda;NSU;Autorização;Plano;Parcela;Rede;Bandeira;Crédito;Débito;Histórico;Número do lote;Mês de referência;Banco;Agência;Conta;Código loja;Loja;Código do Estabelecimento;Número cartão;Área cliente;Reservado
        20190123;20190121;121566895479;121566895479;1;1;GLOBAL;VISA;;-9900;48-*ALUGUEL DE TERMINAL          ;0;201901;246;1;1;110194;Teste Vinculo Cessão;0;0;AAADqEAAAAAADljAAA;
        20190124;20190122;122568370593;512551;1;1;GLOBAL;ELO;;-98;3-VOUCHER REAIS                 ;0;201901;246;1;1;110194;Teste Vinculo Cessão;0;000627780XXXXXX9909;AAADqEAAAAAADljAAG;
        20190128;20190124;124572553538;124572553538;1;1;GLOBAL;VISA;;-19800;134-*AGENDAMENTO COMPENSADO-PRODUT;0;201901;246;1;1;110194;Teste Vinculo Cessão;0;0;AAADqEAAAAAADljAAH;
        20190128;20190124;124570991289;142607;1;1;GLOBAL;ELO;;-98;3-VOUCHER REAIS                 ;0;201901;246;1;1;110194;Teste Vinculo Cessão;0;000627780XXXXXX9909;AAADqEAAAAAADljAAB;
        20190130;20190128;128577717574;128577717574;1;1;GLOBAL;VISA;;-9900;48-*ALUGUEL DE TERMINAL          ;0;201901;246;1;1;110194;Teste Vinculo Cessão;0;0;AAADqEAAAAAADljAAF;
        20190130;20190128;128577717575;128577717575;1;1;GLOBAL;VISA;;-9900;48-*ALUGUEL DE TERMINAL          ;0;201901;246;1;1;110194;Teste Vinculo Cessão;0;0;AAADqEAAAAAADljAAD;
        20190130;20190128;128577717576;128577717576;1;1;GLOBAL;VISA;;-9900;48-*ALUGUEL DE TERMINAL          ;0;201901;246;1;1;110194;Teste Vinculo Cessão;0;0;AAADqEAAAAAADljAAC;
        20190130;20190128;128577717577;128577717577;1;1;GLOBAL;VISA;;-9900;48-*ALUGUEL DE TERMINAL          ;0;201901;246;1;1;110194;Teste Vinculo Cessão;0;0;AAADqEAAAAAADljAAE;`,
        /* eslint-disable max-len */
      });
    };

    siscofConnector.obterRelatorioFinanceiro = (
      participanteId,
      dataInicioOperacao,
      dataFimOperacao
    ) => {
      console.log('SISCOF: obterRelatorioFinanceiro',
        participanteId, dataInicioOperacao, dataFimOperacao);
      return Promise.resolve({
        /* eslint-disable max-len */
        csv: `Data de crédito;Data da venda;NSU;Autorização;Plano;Parcela;Rede;Bandeira;Crédito;Número do lote;Tipo de Lançamento;Banco;Agência;Conta;Código loja;Loja;Código do Estabelecimento;Área cliente;Reservado
        20181024;20180823;13417110194;205433;6;2;GLOBAL;VISA;26966;0;L;246;1;1;110194;Teste Vinculo Cessão;0;AAADqEAAAAAAC6CAAA;
        20181011;20180810;4017110194;243965;4;2;GLOBAL;MASTERCARD;8807;0;L;246;1;1;110194;Teste Vinculo Cessão;0;AAADqEAAAAAAC6CAAB;
        20181008;20180904;24117110194;080927;3;1;GLOBAL;HIPERCARD;5820;0;L;246;1;1;110194;Teste Vinculo Cessão;0;AAADqEAAAAAAC6CAAC;
        20181107;20180904;24117110194;080927;3;2;GLOBAL;HIPERCARD;5820;0;L;246;1;1;110194;Teste Vinculo Cessão;0;AAADqEAAAAAAC6CAAD;
        20181205;20180904;24117110194;080927;3;3;GLOBAL;HIPERCARD;5820;0;L;246;1;1;110194;Teste Vinculo Cessão;0;AAADqEAAAAAAC6CAAE;
        20181008;20180904;24317110194;000403;2;1;GLOBAL;HIPERCARD;4811;0;L;246;1;1;110194;Teste Vinculo Cessão;0;AAADqEAAAAAAC6CAAF;
        20181107;20180904;24317110194;000403;2;2;GLOBAL;HIPERCARD;4811;0;L;246;1;1;110194;Teste Vinculo Cessão;0;AAADqEAAAAAAC6CAAG;
        20181008;20180904;31217110194;052972;6;1;GLOBAL;VISA;10350;0;L;246;1;1;110194;Teste Vinculo Cessão;0;AAADqEAAAAAAC6CAAH;
        20181107;20180904;31217110194;052972;6;2;GLOBAL;VISA;10346;0;L;246;1;1;110194;Teste Vinculo Cessão;0;AAADqEAAAAAAC6CAAI;
        20181205;20180904;31217110194;052972;6;3;GLOBAL;VISA;10346;0;L;246;1;1;110194;Teste Vinculo Cessão;0;AAADqEAAAAAAC6CAAJ;`,
        /* eslint-disable max-len */
      });
    };
  })
  .provide('@siscof-settings', () => {
    const config = {
      user: 'itlab',
      password: '7PzOmjYJac84',
      connectString: '127.0.0.2:1522/dbsiscof',
    };
    return Promise.resolve(config);
  })
  .provide('@log-settings', () => {
    const config = {
      stdoutLevel: 'silly',
      stderrLevel: 'error',
      dbLevel: 'none',
    };
    return Promise.resolve(config);
  })
  .provide('@auth-settings', () => {
    const config = {
      address: 'http://localhost:8080',
      adminUsername: 'admin',
      adminPassword: 'admin',
      clientId: 'alpe-bko',
      clientSecret: 'c1913cde-d8a5-4b76-b6ad-0b7ac3f7940c',
      clientUUID: '3824e71d-017f-452f-97e8-45227231e6d8',
      // eslint-disable-next-line max-len
      // publicKey: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAg/XLu4rHo6ktGQg0rIhy\naq0GvJuJCRm7AvvAf7c0rSqY+r35jvB3Zn3UjCJDiTGO5pCNMQyOfvi1uVFWLPkY\nSipqfw4Efu8uwIBG22iTyCjddqEVm1x5hyeREuYPCX+EcRFMAPudtcrFFRCUXUrg\nkioTU+yohS3+vM3n7ZecjsjUWlsQvIR9++F+UNZSSkqhTH84LFEriMNyKrjzllL0\n718y/tecNhy2gmNVwFYeghX6SPUEwbT5IT7MK1Akd+cXLkUx5YB1svmt8P56fV3g\naXNNyTHwrHDMuryCJ4HDzDsSRCREbsQgPUjZRis/zo0U5AbP2YYhrb6IvUGeOBML\nBwIDAQAB\n-----END PUBLIC KEY-----\n',
      publicKey: 'Shhhhhhh',
      realm: 'alpe',
      baseUrl: 'http://localhost:4200',
    };
    return Promise.resolve(config);
  })
  .provide('@sentry-settings', () => {
    const config = {
      dsn: 'https://79f2165f8f6f4b05ad75cc542927524e@sentry.io/1362831',
      environment: 'development',
    };
    return Promise.resolve(config);
  })
  .init(
    '$auth',
    '@auth-settings',
    '@@roles',
    '$main-db',
    '@@termo-tipo',
    (auth, settings, roles, db, tiposTermo) => {
      const ec = {
        name: 'EC - It Lab',
        preferred_username: 'rorschach',
        given_name: 'Walter',
        family_name: 'Kovacs',
        email: 'ec@alpe.com.br',
        resource_access: {},
      };

      const fornecedor = {
        name: 'Fornecedor - KG Menswear',
        preferred_username: 'stone',
        given_name: 'Charles',
        family_name: 'Stone',
        email: 'fornecedor@alpe.com.br',
        resource_access: {},
      };

      const backoffice = {
        name: 'Alpe - BACKOFFICE',
        preferred_username: 'loord',
        given_name: 'Maxine',
        family_name: 'Key',
        email: 'alpe@alpe.com.br',
        resource_access: {},
      };

      ec.resource_access[settings.clientId] = { roles: [roles.ecFinanceiro] };
      fornecedor.resource_access[settings.clientId] = {
        roles: [roles.fcComercial],
      };
      backoffice.resource_access[settings.clientId] = {
        roles: [roles.boAdministrador, roles.super],
      };

      const users = {
        'ec@alpe.com.br': {
          kcPayload: ec,
          sessionPayload: {
            participante: 1,
            participanteNome: 'It Lab',
            participanteEstabelecimento: true,
            participanteFornecedor: false,
          },
        },
        'fornecedor@alpe.com.br': {
          kcPayload: fornecedor,
          sessionPayload: {
            participante: 2,
            participanteNome: 'KG Menswear',
            participanteEstabelecimento: false,
            participanteFornecedor: true,
          },
        },
        'alpe@alpe.com.br': {
          kcPayload: backoffice,
          sessionPayload: {},
        },
      };

      auth.authenticate = (body) => {
        const action = new Promise((resolve, reject) => {
          const user = users[body.email];

          if (!user) {
            reject(String('user not found!!!!'));
            return;
          }

          const now = new Date();
          const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
          );

          db.entities.termo
            .findOne({
              where: {
                inicio: { $lte: today },
                fim: {
                  $or: {
                    $eq: null,
                    $gt: now,
                  },
                },
                tipo: user.sessionPayload.participanteEstabelecimento
                  ? tiposTermo.contratoMaeEstabelecimento
                  : tiposTermo.contratoMaeFornecedor,
              },
              include: [
                {
                  model: db.entities.participanteAceiteTermo,
                  as: 'aceites',
                  where: {
                    participanteId: user.sessionPayload.participante,
                  },
                },
              ],
            })
            .then((termo) => {
              user.sessionPayload.acceptedTerms = !!termo;
              return user;
            })
            .then(() => {
              const sign = Promise.all([
                new Promise((resolve, reject) => {
                  const action = jwt.sign(
                    user.kcPayload,
                    settings.publicKey,
                    { expiresIn: '24h' },
                    (error, token) => {
                      if (error) reject(error);
                      else resolve(token);
                    },
                  );
                  return action;
                }),
                new Promise((resolve, reject) => {
                  const action = jwt.sign(
                    user.sessionPayload,
                    settings.clientSecret,
                    { expiresIn: '24h' },
                    (error, token) => {
                      if (error) reject(error);
                      else resolve(token);
                    },
                  );
                  return action;
                }),
              ]);

              return sign
                .then((tokens) => {
                  resolve({
                    accessToken: tokens[0],
                    refreshToken: tokens[0],
                    // sessionToken: tokens[1],
                  });
                })
                .catch(error => reject(error));
            });
        });
        return action;
      };

      auth.refreshToken = (_refreshToken) => {
        const tokens = {
          accessToken: _refreshToken,
          refreshToken: _refreshToken,
        };
        return Promise.resolve(tokens);
      };

      auth.getRolesIds = () => Promise.resolve();

      auth.updateUserStatus = (user, enabled) => {
        console.log(
          'fake auth: updateUserStatus',
          `set ${user.email} to ${enabled}`,
        );
        return Promise.resolve(true);
      };

      const _generateSessionToken = auth.generateSessionToken;

      auth.generateSessionToken = (usuario, participante, impersonating) => {
        const getCessionToken = () => {
          const action = new Promise((resolve, reject) => {
            const user = users[usuario];

            if (!user) {
              reject(String('user not found!!!!'));
              return;
            }

            new Promise((resolve, reject) => {
              const sign = jwt.sign(
                user.sessionPayload,
                settings.clientSecret,
                { expiresIn: '24h' },
                (error, token) => {
                  if (error) reject(error);
                  else resolve(token);
                },
              );
              return sign;
            }).then(token => resolve({ sessionToken: token }));
          });
          return action;
        };

        return impersonating
          ? _generateSessionToken(usuario, participante, impersonating)
          : getCessionToken();
      };

      // auth.inviteUser = () => Promise.resolve();
    },
  )
  .provide('@internal-apis-settings', () => {
    const config = {
      addressBancos: 'http://bancos',
      addressCEPs:
        'http://alpe-api-cep-dev.us-east-1.elasticbeanstalk.com/v1/cep',
      financial: {
        auth: 'secret',
        address: 'http://ivendas',
      },
    };
    return Promise.resolve(config);
  })
  .provide('$internal-apis', () => {
    const apis = {
      obterBancos: () => {
        const bancos = [
          { id: '246', text: 'Banco ABC Brasil S.A.' },
          { id: '075', text: 'Banco ABN AMRO S.A.' },
        ];
        return Promise.resolve(bancos);
      },
      obterEndereco: (cep) => {
        const endereco = {
          bairro: 'Itaim Bibi',
          cep,
          cidade: 'São Paulo',
          cidadeId: 3,
          complemento: '',
          complemento2: '',
          end: 'Rua Tabapuã',
          id: '0',
          uf: 'SP',
        };
        return Promise.resolve(endereco);
      },
    };
    return Promise.resolve(apis);
  })

  // -------- DEV FILE STORAGE ---------
  // .loadFiles('environment/file-storage')
  // .provide('@storage-settings', () => Promise.resolve({
  //     region: 'sa-east-1',
  //     bucket: 'alpe-credenciamento'
  // }))
  // -------- NO FILE STORAGE ---------
  .provide('$fileStorage', () => {
    const storage = {
      upload: (fileName) => {
        const obj = { key: fileName, Location: 'http://file-url' };
        return Promise.resolve(obj);
      },
      download: (filename) => {
        const obj = {
          ContentType: 'text/plain',
          Body: `test file for ${filename}`,
        };
        return Promise.resolve(obj);
      },
      name: 'fake',
    };
    return Promise.resolve(storage);
  })
  .init('$mailer', (mailer) => {
    mailer.enviar = (...args) => {
      console.log('enviar email ', args);
      return Promise.resolve();
    };
  })

  .provide('@mailer-settings', () => {
    const config = {
      region: 'us-west-2',
      baseUrl: 'http://localhost:4200',
      origin: 'gabriel.lima@itlab.com.br',
      mailingList: ['stevie.wonder@itlab.com.br'],
    };
    return Promise.resolve(config);
  })

  // ############ FAKE STATIC DATA ############
  .init('$main-db', '$seed', (db, seed) => {
    db.sync({ force: true }).then(() => seed.execute());
  })
  .start()
  .catch(console.log);
