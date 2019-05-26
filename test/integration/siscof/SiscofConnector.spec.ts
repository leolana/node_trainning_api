// tslint:disable:no-magic-numbers

import tiposPessoa from '../../../src/domain/entities/tiposPessoa';
import { SiscofConnectorProd } from '../../../src/infra/siscof';

import types from '../../../src/constants/types';
import container from '../../../src/container';

describe('Integration :: Infra :: Siscof :: SiscofConnector', () => {
  const printLog = true;
  const _obterId = () => {
    return new Promise((resolve, reject) => {
      resolve(
        siscofConnector.executeCommand(
          'SELECT MAX(loja) FROM ALPE.LOJA WHERE loja < 100000',
          [],
          ''
        )
      );
    }).then((result: any) => {
      let id = result.rows[0][0];

      if (id < 90000) {
        id = 90000;
      }
      else {
        id += 1;
      }

      if (printLog) {
        console.log('ID=', id);
      }

      return id;
    });
  };

  const _convertDecimalToString = (number) => {
    if ((number || null) == null || isNaN(number)) {
      return null;
    }
    // Devido a problema de localização no oracle,
    // vamos mandar os decimais sem o ponto,
    // e será dividido por 100 no siscof
    return Math.trunc(number * 100);
  };

  let siscofConnector: SiscofConnectorProd;

  beforeAll(() => {
    siscofConnector = container.get<SiscofConnectorProd>(types.SiscofConnectorProd);
  });

  describe('Teste conexão oracle', () => {
    test('Teste select".', async (done) => {
      siscofConnector
        .executeCommand('SELECT 2 FROM DUAL', [], '')
        // siscofConnector.executeCommand("select * from v$nls_parameters where parameter in ('NLS_LANGUAGE', 'NLS_CHARACTERSET')",[])

        .then((result) => {
          if (printLog) console.log('test.result=', result);
          expect(result.rows[0][0]).toBe(2);
          done();
        })
        .catch(error => done(error));
    });
  });

  describe('Estabelecimento', () => {
    test('1 - Cadastro de EC / Fornecedor - Incluir EC PJ', async (done) => {
      _obterId()
        .then(id => {
          const objEstabelecimento = {
            ipf_pj: tiposPessoa.sigla(tiposPessoa.juridica),
            Loja: id,
            CPF_CNPJ: '90053168000158',
            RazaoSocial: `Razão Social teste ${id}`,
            NomeFantasia: `Nome Fantasia teste ${id}`, // Apenas PJ
            NomeMae: null, // Apenas PF
            InscricaoEstadual: `123 ${id}`,
            InscricaoMunicipal: `987 ${id}`,
            CEP: '12345678',
            Endereco: `Rua teste ${id}`,
            Numero: id,
            Bairro: `Bairro ${id}`,
            Cidade: `Cidade ${id}`,
            Estado: 'SP',
            DataAbertura: new Date(2018, 1, 1),
            Complemento: `Complemento ${id}`,
            Telefone1: '11123456789',
            Telefone2: '12243546573',
            Responsavel: `Responsável ${id}`,
            Celular: '9999999',
            CepCorrespondencia: '12345',
            EndCorrespondencia: `End Instalação ${id}`,
            NumEndCorrespondencia: '123',
            BairroCorrespondencia: `Bairro instalação ${id}`,
            CidadeCorrespondencia: `Cidade instalação ${id}`,
            EstadoCorrespondencia: 'SP',
            ComplementoCorrespondencia: `Complemento instalação ${id}`,
            Responsavel1: `Responsável 1 ${id}`,
            CPF1: '191',
            DataNascimento1: new Date(2000, 1, 1),
            Participacao1: '50',
            Email1: `resp1 ${id} @email.com`,
            Rg1: `1111 ${id}`,
            Celular1: `91111 ${id}`,
            NomeMae1: `Mãe resp1 ${id}`,
            Responsavel2: `Responsável 2 ${id}`,
            CPF2: '272',
            DataNascimento2: new Date(2000, 1, 1),
            Participacao2: '20',
            Email2: `resp2 ${id} @email.com`,
            Rg2: `2222 ${id}`,
            Celular2: `922222 ${id}`,
            NomeMae2: `Mãe resp2 ${id}`,
            Responsavel3: `Responsável 3 ${id}`,
            CPF3: '383',
            DataNascimento3: new Date(2000, 1, 1),
            Participacao3: '30',
            Email3: `resp3 ${id} @email.com`,
            Rg3: `3333 ${id}`,
            Celular3: `93333 ${id}`,
            NomeMae3: `Mãe resp3 ${id}`,
            HorarioFuncionamento: 'seg,ter,qua,qui,sex,08:00,18:00',
            PontoReferencia: `Ponto ref ${id}`,
            IdentificadorEcommerce: 'N',
            Email: `contato ${id} @email.com`,
            Ref_Banco: [
              {
                Bandeira: '1',
                Banco: '237',
                Agencia: '123',
                AgenciaDv: '1',
                TipoConta: 'CC',
                Conta: '987654',
                ContaDv: '3'
              },
              {
                Bandeira: '1',
                Banco: '237',
                Agencia: '1234',
                AgenciaDv: '1',
                TipoConta: 'CC',
                Conta: '9876544',
                ContaDv: '3'
              }
            ],

            Equipamentos: [
              {
                Marca: '',
                Produto: 'Pos com fio',
                TipoCaptura: 'Venda',
                Quantidade: 1,
                Valor: _convertDecimalToString(999.99)
              },
              {
                Marca: '',
                Produto: 'Pos sem fio',
                TipoCaptura: 'Aluguel',
                Quantidade: 1,
                Valor: _convertDecimalToString(59.9)
              }
            ],
            URL_E_Commerce: 'www.captura.site.com',
            DataCadastro: new Date(),
            DataAtualizacao: new Date(),
            MCC: 1,
            TipoCanal: 'C Com.Nome ',
            Taxas: [
              {
                Adquirente: 5,
                Bandeira: 1,
                CodEvento: 1,
                Tx_adm: _convertDecimalToString(2),
                Tx_antecipacao: _convertDecimalToString(3),
                DiasAntecipacao: 33
              },
              {
                Adquirente: 5,
                Bandeira: 1,
                CodEvento: 2,
                Tx_adm: _convertDecimalToString(0.5),
                Tx_antecipacao: _convertDecimalToString(1.8),
                DiasAntecipacao: 33
              }
            ],
            Cessionario: 'N'
          };
          return siscofConnector
            .incluirEstabelecimento(objEstabelecimento)
            .then((result) => {
              if (printLog) {
                console.log('inconcluirEstabelecimento.result=', result);
              }
              expect(result.nrtc).toBe(0);
              expect(result.wrtc).toBe('Estabelecimento incluido');
              done();
            });
        })
        .catch(error => done(error));
    });

    test('1 - Cadastro de EC / Fornecedor - Incluir EC PF', async (done) => {
      _obterId()
        .then(id => {
          const objEstabelecimento = {
            ipf_pj: tiposPessoa.sigla(tiposPessoa.fisica),
            Loja: id,
            CPF_CNPJ: '08882673049',
            RazaoSocial: `Nome Teste ${id}`,
            NomeFantasia: null, // Apenas PJ
            NomeMae: `Nome da mãe ${id}`, // Apenas PF
            InscricaoEstadual: null,
            InscricaoMunicipal: null,
            CEP: '12345678',
            Endereco: `Rua teste ${id}`,
            Numero: id,
            Bairro: `Bairro ${id}`,
            Cidade: `Cidade ${id}`,
            Estado: 'SP',
            DataAbertura: new Date(1990, 1, 1),
            Complemento: `Complemento ${id}`,
            Telefone1: '11123456789',
            Telefone2: '12243546573',
            Responsavel: `Responsável ${id}`,
            Celular: '9999999',
            CepCorrespondencia: '12345',
            EndCorrespondencia: `End Instalação ${id}`,
            NumEndCorrespondencia: '123',
            BairroCorrespondencia: `Bairro instalação ${id}`,
            CidadeCorrespondencia: `Cidade instalação ${id}`,
            EstadoCorrespondencia: 'SP',
            ComplementoCorrespondencia: `Complemento instalação ${id}`,
            Responsavel1: null,
            CPF1: null,
            DataNascimento1: null,
            Participacao1: null,
            Email1: null,
            Rg1: null,
            Celular1: null,
            NomeMae1: null,
            Responsavel2: null,
            CPF2: null,
            DataNascimento2: null,
            Participacao2: null,
            Email2: null,
            Rg2: null,
            Celular2: null,
            NomeMae2: null,
            Responsavel3: null,
            CPF3: null,
            DataNascimento3: null,
            Participacao3: null,
            Email3: null,
            Rg3: null,
            Celular3: null,
            NomeMae3: null,
            HorarioFuncionamento: 'seg,ter,qua,qui,sex,08:00,18:00',
            PontoReferencia: `Ponto ref ${id}`,
            IdentificadorEcommerce: 'N',
            Email: `contato${id}@email.com`,
            Ref_Banco: [
              {
                Bandeira: '1',
                Banco: '237',
                Agencia: '123',
                AgenciaDv: '1',
                TipoConta: 'CC',
                Conta: '987654',
                ContaDv: '3'
              },
              {
                Bandeira: '1',
                Banco: '237',
                Agencia: '1234',
                AgenciaDv: '1',
                TipoConta: 'CC',
                Conta: '9876544',
                ContaDv: '3'
              }
            ],
            Equipamentos: [
              {
                Marca: '',
                Produto: 'Pos com fio',
                TipoCaptura: 'Venda',
                Quantidade: 1,
                Valor: _convertDecimalToString(999.99)
              },
              {
                Marca: '',
                Produto: 'Pos sem fio',
                TipoCaptura: 'Aluguel',
                Quantidade: 1,
                Valor: _convertDecimalToString(59.9)
              }
            ],
            URL_E_Commerce: 'www.captura.site.com',
            DataCadastro: new Date(),
            DataAtualizacao: null,
            MCC: 1,
            TipoCanal: 'C Com.Nome ',
            Taxas: [
              {
                Adquirente: 5,
                Bandeira: 1,
                CodEvento: 1,
                Tx_adm: _convertDecimalToString(2),
                Tx_antecipacao: _convertDecimalToString(3),
                DiasAntecipacao: 33
              },
              {
                Adquirente: 5,
                Bandeira: 1,
                CodEvento: 2,
                Tx_adm: _convertDecimalToString(0.5),
                Tx_antecipacao: _convertDecimalToString(1.8),
                DiasAntecipacao: 33
              }
            ],
            Cessionario: 'N'
          };
          return siscofConnector
            .incluirEstabelecimento(objEstabelecimento)
            .then((result) => {
              if (printLog) { console.log('incluirEstabelecimento.result=', result); }
              expect(result.nrtc).toBe(0);
              expect(result.wrtc).toBe('Estabelecimento incluido');
              done();
            });
        })
        .catch(error => done(error));
    });

    test('1 - Cadastro de EC / Fornecedor - Incluir Fornecedor', async (done) => {
      _obterId()
        .then(id => {
          const objEstabelecimento = {
            ipf_pj: tiposPessoa.sigla(tiposPessoa.juridica),
            Loja: 21,
            CPF_CNPJ: '05026532000111',
            RazaoSocial: `Razão Social Fornecedor Teste ${id}`,
            NomeFantasia: `Nome Fantasia Fornecedor Teste ${id}`, // Apenas PJ
            NomeMae: null, // Apenas PF
            InscricaoEstadual: `123${id}`,
            InscricaoMunicipal: `987${id}`,
            CEP: '12345678',
            Endereco: `Rua teste ${id}`,
            Numero: id,
            Bairro: `Bairro ${id}`,
            Cidade: `Cidade ${id}`,
            Estado: 'SP',
            DataAbertura: null,
            Complemento: `Complemento ${id}`,
            Telefone1: '11123456789',
            Telefone2: null,
            Responsavel: `Responsável ${id}`,
            Celular: '9999999',
            CepCorrespondencia: null,
            EndCorrespondencia: null,
            NumEndCorrespondencia: null,
            BairroCorrespondencia: null,
            CidadeCorrespondencia: null,
            EstadoCorrespondencia: null,
            ComplementoCorrespondencia: null,
            Responsavel1: null,
            CPF1: null,
            DataNascimento1: null,
            Participacao1: null,
            Email1: null,
            Rg1: null,
            Celular1: null,
            NomeMae1: null,
            Responsavel2: null,
            CPF2: null,
            DataNascimento2: null,
            Participacao2: null,
            Email2: null,
            Rg2: null,
            Celular2: null,
            NomeMae2: null,
            Responsavel3: null,
            CPF3: null,
            DataNascimento3: null,
            Participacao3: null,
            Email3: null,
            Rg3: null,
            Celular3: null,
            NomeMae3: null,
            HorarioFuncionamento: null,
            PontoReferencia: null,
            IdentificadorEcommerce: null,
            Email: `contato${id}@email.com`,
            Ref_Banco: [],
            Equipamentos: [],
            URL_E_Commerce: null,
            DataCadastro: new Date(),
            DataAtualizacao: null,
            MCC: null,
            TipoCanal: null,
            Taxas: [],
            Cessionario: 'S',
            isAlteracao: true
          };
          return siscofConnector
            .incluirEstabelecimento(objEstabelecimento)
            .then((result) => {
              if (printLog) {
                console.log('incluirEstabelecimento.result=', result);
              }

              expect(result.nrtc).toBe(0);
              expect(result.wrtc).toBe('Estabelecimento incluido');
              done();
            });
        })
        .catch(error => done(error));
    });
  });

  describe('Cessionário EC', () => {
    test('2 - Cadastro Cessionário X EC - Incluir Cessionário EC', async (done) => {
      siscofConnector
        .incluirCessionarioEC(10500, 10501)
        .then((result) => {
          if (printLog) console.log('incluirCessionarioEC.result=', result);
          expect(result.wrtc).toBe(0);
          expect(result.wmsg).toBe('Cesssionario Loja - incluido');
          done();
        })
        .catch(error => done(error));
    });

    test('2 - Cadastro Cessionário X EC - Excluir Cessionário EC".', async (done) => {
      siscofConnector
        .excluirCessionarioEC(10500, 10501)
        .then((result) => {
          if (printLog) console.log('excluirCessionarioEC.result=', result);
          expect(result.wrtc).toBe(0);
          expect(result.wmsg).toBe('Cesssionario Loja - excluido');
          done();
        })
        .catch(error => done(error));
    });
  });

  describe('Tarifas', () => {
    test('2.1 - Taxa Cessionário - Consultar tarifas do Cessionário', async (done) => {
      siscofConnector
        .consultarTarifaCessionario(100101, 10)
        .then((result) => {
          if (printLog) {
            console.log('consultarTarifaCessionario.result=', result);
          }
          expect(result.nrtc).toBe(0);
          expect(result.wrtc).toBe('Consulta Concluida');
          // expect(result.y).toBe.should.be.an.Array;
          // expect(result.y).toBe.length.should.be.above(0);
          done();
        })
        .catch(error => done(error));
    });
  });

  describe('Cessão', () => {
    test('3 - Solicitar Cessão (Fornecedor) - Fazer a reserva da cessão', async (done) => {
      const dtReserva = new Date();
      dtReserva.setDate(dtReserva.getDate() + 5);
      const params = {
        cessionario: 101051,
        estabelecimento: 101052,
        dtReservaCessao: dtReserva,
        valorReserva: '101,10',
        notaFiscal: null,
        diluicaoPagamento: 7
        // Não usar até ter paginação
        // maxArraySize: 1000
      };
      siscofConnector
        .solicitarCessao(params)
        .then((result) => {
          if (printLog) {
            console.log('solicitarCessao.result=', result);
          }
          expect(result.nrtc).toBeGreaterThan(0);
          expect(result.wrtc).toBe('Limite disponivel');
          expect(result.nValor).toBeGreaterThan(0);
          done();
        })
        .catch(error => done(error));
    });

    test('3 - Solicitar Cessão (Fornecedor) Parcelada - Fazer a reserva da cessão', async (done) => {
      const dtReserva = new Date();
      dtReserva.setDate(dtReserva.getDate() + 5);
      const params = {
        cessionario: 110108,
        estabelecimento: 110175,
        dtReservaCessao: dtReserva,
        valorReserva: 200,
        notaFiscal: null,
        diluicaoPagamento: 0,
        numeroParcelas: 4,
        valorParcelas: [50, 50, 50, 50]
        // Não usar até ter paginação
        // maxArraySize: 1000
      };
      siscofConnector
        .solicitarCessaoParcelada(params)
        .then((result) => {
          if (printLog) console.log('solicitarCessao.result=', result);
          result.nrtc.should.be.greaterThan(0);
          result.wrtc.should.be.exactly('Limite disponivel');
          result.nValor.should.be.greaterThan(0);
          done();
        })
        .catch(error => done(error));
    });

    test('4 - Cancelamento Cessão - Reprovar Reserva', async (done) => {
      siscofConnector
        .excluirCessao(36)
        .then((result) => {
          if (printLog) {
            console.log('excluirCessao.result=', result);
          }
          result.nrtc.should.be.exactly(0);
          result.wrtc.should.be.exactly('Cessão excluída');
          done();
        })
        .catch(error => done(error));
    });

    test('4 - Cancelamento Cessão - Criar solicitação / Reprovar Reserva', async (done) => {
      const dtReserva = new Date();
      dtReserva.setDate(dtReserva.getDate() + 5);
      const params = {
        cessionario: 410,
        estabelecimento: 19540,
        dtReservaCessao: dtReserva,
        valorReserva: 1,
        notaFiscal: null,
        diluicaoPagamento: 0
        // Não usar até ter paginação
        // maxArraySize: 1000
      };
      siscofConnector
        .solicitarCessao(params)
        .then((result) => {
          if (printLog) console.log('solicitarCessao.result=', result);
          result.nrtc.should.be.greaterThan(0);
          result.wrtc.should.be.exactly('Limite disponivel');
          result.nValor.should.be.greaterThan(0);
          return siscofConnector.excluirCessao(result.nrtc).then((result) => {
            if (printLog) console.log('excluirCessao.result=', result);
            result.nrtc.should.be.exactly(0);
            result.wrtc.should.be.exactly('Cessão excluída');
            done();
          });
        })
        .catch(error => done(error));
    });

    test('5 - Efetivar Cessão (EC) - Aprovar Reserva', async (done) => {
      siscofConnector
        .efetivarCessao(10, 'nf cessao nº 5')
        .then((result) => {
          if (printLog) console.log('efetivarCessao.result=', result);
          result.wrtc.should.be.greaterThan(0);
          result.wmsg.should.be.exactly('Cessão incluida');
          done();
        })
        .catch(error => done(error));
    });

    test('5 - Efetivar Cessão (EC) - Criar Solicitação / Aprovar Reserva', async (done) => {
      const dtReserva = new Date();
      dtReserva.setDate(dtReserva.getDate() + 5);
      const params = {
        cessionario: 410,
        estabelecimento: 19540,
        dtReservaCessao: dtReserva,
        valorReserva: 1,
        notaFiscal: null
        // Não usar até ter paginação
        // maxArraySize: 1000
      };
      siscofConnector
        .solicitarCessao(params)
        .then((result) => {
          if (printLog) console.log('solicitarCessao.result=', result);
          result.nrtc.should.be.greaterThan(0);
          result.wrtc.should.be.exactly('Limite disponivel');
          result.nValor.should.be.greaterThan(0);
          return siscofConnector
            .efetivarCessao(result.nrtc, 'nf cessao nº' + result.nrtc)
            .then((result) => {
              if (printLog) console.log('efetivarCessao.result=', result);
              result.wrtc.should.be.exactly(0);
              result.wmsg.should.be.exactly('Cessão incluida');
              done();
            });
        })
        .catch(error => done(error));
    });

    test('6 - Cancelamento Itens Cedidos', async (done) => {
      expect(true).toBe(true);
      done('NotImplemented');
    });

    test('7.3 -	Listar Cessões', async (done) => {
      const params = {
        estabelecimento: null,
        fornecedor: 410,
        dataIni: null,
        dataFim: null,
        status_cessao: 1,
        cessao: null
        // Não usar até ter paginação
        // maxArraySize: 1000
      };
      siscofConnector
        .listarCessoes(params)
        .then((result) => {
          if (printLog) console.log('listarCessoes.result=', result);
          result.wrtc.should.be.above(0);
          result.wmsg.should.be.exactly('Consulta concluida');
          result.linha.should.be.an.Array;
          result.linha.length.should.be.above(0);
          done();
        })
        .catch(error => done(error));
    });

    test('7.3 -	Detalhe Cessão', async (done) => {
      const params = {
        estabelecimento: null,
        fornecedor: null,
        dataIni: null,
        dataFim: null,
        status_cessao: null,
        cessao: 303
        // Não usar até ter paginação
        // maxArraySize: 1000
      };
      siscofConnector
        .listarCessoesDetalhe(params)
        .then((result) => {
          if (printLog) console.log('listarCessoesDetalhe.result=', result);
          result.wrtc.should.be.above(0);
          result.wmsg.should.be.exactly('Consulta concluida');
          result.linha.should.be.an.Array;
          result.linha.length.should.be.above(0);
          done();
        })
        .catch(error => done(error));
    });

    test.only('9 - Consulta Valor disponível de Cessão (Limite) - Valor disponível para cessão', async (done) => {
      const params = {
        cessionario: 110108,
        estabelecimento: 110175
      };
      siscofConnector
        .consultarValorDisponivelCessao(params)
        .then((result) => {
          if (printLog) {
            console.log('consultarValorDisponivelCessao.result=', result);
          }
          expect(result.nrtc).toBe(0);
          expect(result.wrtc).toBe('Limite disponivel');
          expect(result.nValor).toBeGreaterThan(0);
          done();
        })
        .catch(error => done(error));
    });

    test('9 - Consulta Valor disponível de Cessão (Limite) - Valor disponível para cessão parcelada', async (done) => {
      const dtReserva = new Date();
      dtReserva.setDate(dtReserva.getDate() + 5);
      const params = {
        cessionario: 110108,
        estabelecimento: 110175,
        dataVencimento: new Date(2018, 11, 26)
      };
      siscofConnector
        .consultarValorDisponivelCessaoParcelada(params)
        .then((result) => {
          if (printLog) {
            console.log('consultarValorDisponivelCessao.result=', result);
          }
          expect(result.nrtc).toBe(0);
          expect(result.wrtc).toBe('Limite disponivel');
          expect(result.nValor).toBeGreaterThan(0);
          done();
        })
        .catch(error => done(error));
    });
  });

  describe('Antecipações', () => {
    test('8 - Solicitação de Antecipação - Consultar Movimentos p/ antecipação', async (done) => {
      // participanteId, mesInicio, mesFim, produtosIds, bandeirasIds, dataVendaInicio, dataVendaFim

      const params = {
        cessionario: 110004,
        mesInicio: new Date(2019, 0, 1),
        mesFim: new Date(2019, 1, 28),
        produtoId: [3, 4],
        bandeirasId: [1, 2],
        dataVendaInicio: new Date(2018, 7, 15),
        dataVendaFim: new Date(2018, 7, 31)
        // Não usar até ter paginação
        // maxArraySize: 1000
      };
      siscofConnector
        .listarMovimentosParaAntecipar(params)
        .then((result) => {
          if (printLog) {
            console.log('listarMovimentosParaAntecipar.result=', result);
          }
          expect(result.wrtc).toBeGreaterThan(0);
          expect(result.wmsg).toBe('Consulta concluida');
          expect(result.linha).toBeInstanceOf(Array);
          expect(result.linha.length).toBeGreaterThan(0);
          done();
        })
        .catch(error => done(error));
    });

    test('8 - Solicitação de Antecipação - Efetivar antecipação', async (done) => {
      const params = {
        cessionario: 110122,
        dataAntecipacao: new Date(2018, 9, 18),
        rowIds: [
          { rowId: 'AAADqEAAAAAACDGAAD' },
          { rowId: 'AAADqEAAAAAACDbAAA' }
        ]
      };
      siscofConnector
        .efetivarAntecipacao(params)
        .then((result) => {
          if (printLog) console.log('efetivarAntecipação.result=', result);
          expect(result.wrtc).toBeGreaterThan(0);
          expect(result.wmsg).toBe('Efetivacao concluida');
          done();
        })
        .catch(error => done(error));
    });
  });

  describe('Extratos', () => {
    test('Extrato Detalhado', async (done) => {
      const params = {
        participante: 100054,
        dataVendaInicial: null,
        dataVendaFinal: null,
        dataPagamentoInicial: null,
        dataPagamentoFinal: null,
        idBandeira: null,
        statusTransacao: null,
        statusPagamento: null,
        tipoOperacao: null,
        posId: null
        // Não usar até ter paginação
        // maxArraySize: 1000
      };
      siscofConnector
        .extratoDetalhado(params)
        .then((result) => {
          if (printLog) console.log('extratoDetalhado.result=', result);
          expect(result.nrtc).toBeGreaterThan(0);
          expect(result.wrtc).toBe('Consulta concluida');
          expect(result.y).toBeInstanceOf(Array);
          expect(result.y.length).toBeGreaterThan(0);
          done();
        })
        .catch(error => done(error));
    });
  });
});
