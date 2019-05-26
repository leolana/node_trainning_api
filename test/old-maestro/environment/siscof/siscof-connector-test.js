let Maestro = require('maestro-io');
let di = new Maestro(`${__dirname}/../..`);
let env = {};
let printLog = true;

describe('$siscof', function () {
    this.timeout(10000);

    let _obterId = () => {
        return new Promise(function(resolve, reject) {
            resolve(env.service.executeCommand('SELECT MAX(loja) FROM ALPE.LOJA WHERE loja < 100000',[]))
          }).then(result => {

            id = result.rows[0][0];

            if(id < 90000) id = 90000;
            else id += 1;

            if(printLog) console.log('ID=', id)
            return id;

          })
    }

    let _convertDecimalToString = (number) => {
        if(((number || null) == null) || isNaN(number) ){return null};
        //Devido a problema de localização no oracle,
        //vamos mandar os decimais sem o ponto,
        // e será dividido por 100 no siscof
        return Math.trunc(number*100);
    }

    before('Loading modules / mocks', () => {
        return di
            .loadFiles('./../src/environment/siscof/siscof-connector',
                './../src/environment/siscof/siscof-cmd',
                './../src/environment/siscof/siscof-db',
                './../src/environment/siscof/siscof-formatter',
                 './../src/model/tipos-pessoa', './mocks/settings-db')
            .start()
            .then((di) => {
                env.service = di.resolve('$siscof-connector'),
                //env.service = di.resolve('$siscof-cmd'),
                //env.service = di.resolve('$siscof-db'),
                //env.service = di.resolve('$siscof-formatter'),
                env.tiposPesssoa = di.resolve('@@tipos-pessoa');
            });
    });

    describe('Teste conexão oracle', () => {
        it('Teste select".', (done) => {
            env.service.executeCommand('SELECT 2 FROM DUAL',[])
            //env.service.executeCommand("select * from v$nls_parameters where parameter in ('NLS_LANGUAGE', 'NLS_CHARACTERSET')",[])

            .then(result => {
                    if(printLog) console.log('test.result=', result);
                    result.rows[0][0].should.be.exactly(2);
                    done();
                })
                .catch(error => done(error));
        });
    });

    describe('Estabelecimento', () => {
        it('1 - Cadastro de EC / Fornecedor - Incluir EC PJ', (done) => {
            _obterId()
            .then((id) =>{
                let objEstabelecimento = {
                    ipf_pj                      : env.tiposPesssoa.sigla(env.tiposPesssoa.juridica),
                    Loja                        : id,
                    CPF_CNPJ                    : '90053168000158',
                    RazaoSocial                 : 'Razão Social teste ' + id,
                    NomeFantasia                : 'Nome Fantasia teste ' + id, //Apenas PJ
                    NomeMae                     : null, //Apenas PF
                    InscricaoEstadual           : '123' + id,
                    InscricaoMunicipal          : '987' + id,
                    CEP                         : '12345678',
                    Endereco                    : 'Rua teste '+id,
                    Numero                      : id,
                    Bairro                      : 'Bairro ' + id,
                    Cidade                      : 'Cidade ' + id,
                    Estado                      : 'SP',
                    DataAbertura                : new Date(2018, 1, 1),
                    Complemento                 : 'Complemento ' + id,
                    Telefone1                   : '11123456789',
                    Telefone2                   : '12243546573',
                    Responsavel                 : 'Responsável ' + id,
                    Celular                     : '9999999',
                    CepCorrespondencia          : '12345',
                    EndCorrespondencia          : 'End Instalação ' + id,
                    NumEndCorrespondencia       : '123',
                    BairroCorrespondencia       : 'Bairro instalação ' + id,
                    CidadeCorrespondencia       : 'Cidade instalação ' + id,
                    EstadoCorrespondencia       : 'SP',
                    ComplementoCorrespondencia  : 'Complemento instalação ' + id,
                    Responsavel1                : 'Responsável 1 ' + id,
                    CPF1                        : '191',
                    DataNascimento1             : new Date(2000, 1, 1),
                    Participacao1               : '50',
                    Email1                      : 'resp1'+ id +'@email.com',
                    Rg1                         : '1111' + id,
                    Celular1                    : '91111' + id,
                    NomeMae1                    : 'Mãe resp1' + id,
                    Responsavel2                : 'Responsável 2 ' + id,
                    CPF2                        : '272',
                    DataNascimento2             : new Date(2000, 1, 1),
                    Participacao2               : '20',
                    Email2                      : 'resp2'+ id +'@email.com',
                    Rg2                         : '2222' + id,
                    Celular2                    : '922222' + id,
                    NomeMae2                    : 'Mãe resp2 ' + id,
                    Responsavel3                : 'Responsável 3 ' + id,
                    CPF3                        : '383',
                    DataNascimento3             : new Date(2000, 1, 1),
                    Participacao3               : '30',
                    Email3                      : 'resp3'+ id +'@email.com',
                    Rg3                         : '3333' + id,
                    Celular3                    : '93333' + id,
                    NomeMae3                    : 'Mãe resp3 ' + id,
                    HorarioFuncionamento        : 'seg,ter,qua,qui,sex,08:00,18:00',
                    PontoReferencia             : 'Ponto ref ' + id,
                    IdentificadorEcommerce      : 'N',
                    Email                       : 'contato' + id + '@email.com',
                    Ref_Banco                   : [
                                                    {
                                                        Bandeira : '1',
                                                        Banco    : '237',
                                                        Agencia  : '123',
                                                        AgenciaDv: '1',
                                                        TipoConta: 'CC',
                                                        Conta    : '987654',
                                                        ContaDv  : '3'
                                                    },
                                                    {
                                                        Bandeira : '1',
                                                        Banco    : '237',
                                                        Agencia  : '1234',
                                                        AgenciaDv: '1',
                                                        TipoConta: 'CC',
                                                        Conta    : '9876544',
                                                        ContaDv  : '3'
                                                    },
                                                  ],

                    Equipamentos                : [
                                                    {
                                                        Marca       : '',
                                                        Produto     : 'Pos com fio',
                                                        TipoCaptura : 'Venda',
                                                        Quantidade  : 1,
                                                        Valor       : _convertDecimalToString(999.99)
                                                    },
                                                    {
                                                        Marca       : '',
                                                        Produto     : 'Pos sem fio',
                                                        TipoCaptura : 'Aluguel',
                                                        Quantidade  : 1,
                                                        Valor       : _convertDecimalToString(59.9)
                                                    }
                                                  ],
                    URL_E_Commerce              : 'www.captura.site.com',
                    DataCadastro                : new Date(),
                    DataAtualizacao             : new Date(),
                    MCC                         : 1,
                    TipoCanal                   : 'C Com.Nome ',
                    Taxas                       : [
                                                    {
                                                        Adquirente      : 5,
                                                        Bandeira        : 1,
                                                        CodEvento       : 1,
                                                        Tx_adm          : _convertDecimalToString(2),
                                                        Tx_antecipacao  : _convertDecimalToString(3),
                                                        DiasAntecipacao : 33
                                                    },
                                                    {
                                                        Adquirente      : 5,
                                                        Bandeira        : 1,
                                                        CodEvento       : 2,
                                                        Tx_adm          : _convertDecimalToString(0.5),
                                                        Tx_antecipacao  : _convertDecimalToString(1.8),
                                                        DiasAntecipacao : 33
                                                    }
                                                  ],
                    Cessionario                 : 'N',
                };
                return env.service.incluirEstabelecimento(objEstabelecimento)
                .then(result => {
                    if(printLog)console.log('incluirEstabelecimento.result=', result);
                    result.nrtc.should.be.exactly(0);
                    result.wrtc.should.be.exactly('Estabelecimento incluido');
                    done();
                })
            })
            .catch(error => done(error));
        });

        it('1 - Cadastro de EC / Fornecedor - Incluir EC PF', (done) => {
            _obterId()
            .then((id) =>{
                 let objEstabelecimento = {
                     ipf_pj                      : env.tiposPesssoa.sigla(env.tiposPesssoa.fisica),
                     Loja                        : id,
                     CPF_CNPJ                    : '08882673049',
                     RazaoSocial                 : 'Nome Teste ' + id,
                     NomeFantasia                : null, //Apenas PJ
                     NomeMae                     : 'Nome da mãe ' + id, //Apenas PF
                     InscricaoEstadual           : null,
                     InscricaoMunicipal          : null,
                     CEP                         : '12345678',
                     Endereco                    : 'Rua teste '+id,
                     Numero                      : id,
                     Bairro                      : 'Bairro ' + id,
                     Cidade                      : 'Cidade ' + id,
                     Estado                      : 'SP',
                     DataAbertura                : new Date(1990, 1, 1),
                     Complemento                 : 'Complemento ' + id,
                     Telefone1                   : '11123456789',
                     Telefone2                   : '12243546573',
                     Responsavel                 : 'Responsável ' + id,
                     Celular                     : '9999999',
                     CepCorrespondencia          : '12345',
                     EndCorrespondencia          : 'End Instalação ' + id,
                     NumEndCorrespondencia       : '123',
                     BairroCorrespondencia       : 'Bairro instalação ' + id,
                     CidadeCorrespondencia       : 'Cidade instalação ' + id,
                     EstadoCorrespondencia       : 'SP',
                     ComplementoCorrespondencia  : 'Complemento instalação ' + id,
                     Responsavel1                : null,
                     CPF1                        : null,
                     DataNascimento1             : null,
                     Participacao1               : null,
                     Email1                      : null,
                     Rg1                         : null,
                     Celular1                    : null,
                     NomeMae1                    : null,
                     Responsavel2                : null,
                     CPF2                        : null,
                     DataNascimento2             : null,
                     Participacao2               : null,
                     Email2                      : null,
                     Rg2                         : null,
                     Celular2                    : null,
                     NomeMae2                    : null,
                     Responsavel3                : null,
                     CPF3                        : null,
                     DataNascimento3             : null,
                     Participacao3               : null,
                     Email3                      : null,
                     Rg3                         : null,
                     Celular3                    : null,
                     NomeMae3                    : null,
                     HorarioFuncionamento        : 'seg,ter,qua,qui,sex,08:00,18:00',
                     PontoReferencia             : 'Ponto ref ' + id,
                     IdentificadorEcommerce      : 'N',
                     Email                       : 'contato' + id + '@email.com',
                     Ref_Banco                   : [
                                                        {
                                                            Bandeira : '1',
                                                            Banco    : '237',
                                                            Agencia  : '123',
                                                            AgenciaDv: '1',
                                                            TipoConta: 'CC',
                                                            Conta    : '987654',
                                                            ContaDv  : '3'
                                                        },
                                                        {
                                                            Bandeira : '1',
                                                            Banco    : '237',
                                                            Agencia  : '1234',
                                                            AgenciaDv: '1',
                                                            TipoConta: 'CC',
                                                            Conta    : '9876544',
                                                            ContaDv  : '3'
                                                        },
                                                   ],
                     Equipamentos                : [
                                                        {
                                                            Marca       : '',
                                                            Produto     : 'Pos com fio',
                                                            TipoCaptura : 'Venda',
                                                            Quantidade  : 1,
                                                            Valor       : _convertDecimalToString(999.99)
                                                        },
                                                        {
                                                            Marca       : '',
                                                            Produto     : 'Pos sem fio',
                                                            TipoCaptura : 'Aluguel',
                                                            Quantidade  : 1,
                                                            Valor       : _convertDecimalToString(59.9)
                                                        }
                                                   ],
                     URL_E_Commerce              : 'www.captura.site.com',
                     DataCadastro                : new Date(),
                     DataAtualizacao             : null,
                     MCC                         : 1,
                     TipoCanal                   : 'C Com.Nome ',
                     Taxas                       : [
                                                        {
                                                            Adquirente      : 5,
                                                            Bandeira        : 1,
                                                            CodEvento       : 1,
                                                            Tx_adm          : _convertDecimalToString(2),
                                                            Tx_antecipacao  : _convertDecimalToString(3),
                                                            DiasAntecipacao : 33
                                                        },
                                                        {
                                                            Adquirente      : 5,
                                                            Bandeira        : 1,
                                                            CodEvento       : 2,
                                                            Tx_adm          : _convertDecimalToString(0.5),
                                                            Tx_antecipacao  : _convertDecimalToString(1.8),
                                                            DiasAntecipacao : 33
                                                        }
                                                   ],
                     Cessionario                  : 'N',
                 };
                 return env.service.incluirEstabelecimento(objEstabelecimento)
                 .then(result => {
                     if(printLog)console.log('incluirEstabelecimento.result=', result);
                     result.nrtc.should.be.exactly(0);
                     result.wrtc.should.be.exactly('Estabelecimento incluido');
                     done();
                 })
             })
             .catch(error => done(error));
         });

         it('1 - Cadastro de EC / Fornecedor - Incluir Fornecedor', (done) => {
            _obterId()
            .then((id) =>{
                let objEstabelecimento = {
                    ipf_pj                      : env.tiposPesssoa.sigla(env.tiposPesssoa.juridica),
                    Loja                        : 21,
                    CPF_CNPJ                    : '05026532000111',
                    RazaoSocial                 : 'Razão Social Fornecedor Teste ' + id,
                    NomeFantasia                : 'Nome Fantasia Fornecedor Teste ' + id, //Apenas PJ
                    NomeMae                     : null, //Apenas PF
                    InscricaoEstadual           : '123' + id,
                    InscricaoMunicipal          : '987' + id,
                    CEP                         : '12345678',
                    Endereco                    : 'Rua teste '+id,
                    Numero                      : id,
                    Bairro                      : 'Bairro ' + id,
                    Cidade                      : 'Cidade ' + id,
                    Estado                      : 'SP',
                    DataAbertura                : null,
                    Complemento                 : 'Complemento ' + id,
                    Telefone1                   : '11123456789',
                    Telefone2                   : null,
                    Responsavel                 : 'Responsável ' + id,
                    Celular                     : '9999999',
                    CepCorrespondencia          : null,
                    EndCorrespondencia          : null,
                    NumEndCorrespondencia       : null,
                    BairroCorrespondencia       : null,
                    CidadeCorrespondencia       : null,
                    EstadoCorrespondencia       : null,
                    ComplementoCorrespondencia  : null,
                    Responsavel1                : null,
                    CPF1                        : null,
                    DataNascimento1             : null,
                    Participacao1               : null,
                    Email1                      : null,
                    Rg1                         : null,
                    Celular1                    : null,
                    NomeMae1                    : null,
                    Responsavel2                : null,
                    CPF2                        : null,
                    DataNascimento2             : null,
                    Participacao2               : null,
                    Email2                      : null,
                    Rg2                         : null,
                    Celular2                    : null,
                    NomeMae2                    : null,
                    Responsavel3                : null,
                    CPF3                        : null,
                    DataNascimento3             : null,
                    Participacao3               : null,
                    Email3                      : null,
                    Rg3                         : null,
                    Celular3                    : null,
                    NomeMae3                    : null,
                    HorarioFuncionamento        : null,
                    PontoReferencia             : null,
                    IdentificadorEcommerce      : null,
                    Email                       : 'contato' + id + '@email.com',
                    Ref_Banco                   : [],
                    Equipamentos                : [],
                    URL_E_Commerce              : null,
                    DataCadastro                : new Date(),
                    DataAtualizacao             : null,
                    MCC                         : null,
                    TipoCanal                   : null,
                    Taxas                       : [],
                    Cessionario                 : 'S',
                    isAlteracao                 : true,
                };
                return env.service.incluirEstabelecimento(objEstabelecimento)
                .then(result => {
                    if(printLog)console.log('incluirEstabelecimento.result=', result);
                    result.nrtc.should.be.exactly(0);
                    result.wrtc.should.be.exactly('Estabelecimento incluido');
                    done();
                })
            })
            .catch(error => done(error));
         });

    });

    describe('Cessionário EC', () => {
        it('2 - Cadastro Cessionário X EC - Incluir Cessionário EC', (done) => {
            env.service.incluirCessionarioEC(10500, 10501)
                .then(result => {
                    if(printLog)console.log('incluirCessionarioEC.result=', result);
                    result.wrtc.should.be.exactly(0);
                    result.wmsg.should.be.exactly('Cesssionario Loja - incluido');
                    done();
                })
                .catch(error => done(error));
        });

        it('2 - Cadastro Cessionário X EC - Excluir Cessionário EC".', (done) => {
            env.service.excluirCessionarioEC(10500, 10501)
                .then(result => {
                    if(printLog)console.log('excluirCessionarioEC.result=', result);
                    result.wrtc.should.be.exactly(0);
                    result.wmsg.should.be.exactly('Cesssionario Loja - excluido');
                    done();
                })
                .catch(error => done(error));
        });
    });
    describe('Tarifas', () => {
        it('2.1 - Taxa Cessionário - Consultar tarifas do Cessionário', (done) => {
            env.service.consultarTarifaCessionario(100101, 10)
                .then(result => {
                    if(printLog)console.log('consultarTarifaCessionario.result=', result);
                    result.nrtc.should.be.exactly(0);
                    result.wrtc.should.be.exactly('Consulta Concluida');
                    result.y.should.be.an.Array;
                    (result.y.length).should.be.above(0);
                    done();
                })
                .catch(error => done(error));
        });
    });

    describe('Cessão', () => {
        it('3 - Solicitar Cessão (Fornecedor) - Fazer a reserva da cessão', (done) => {
            let dtReserva = new Date();
            dtReserva.setDate(dtReserva.getDate()  + 5);
            let params = {
                cessionario:  101051,
                estabelecimento:  101052,
                dtReservaCessao: dtReserva,
                valorReserva: "101,10",
                notaFiscal: null,
                diluicaoPagamento : 7,
                //Não usar até ter paginação
               // maxArraySize: 1000
            }
            env.service.solicitarCessao(params)
                .then(result => {
                    if(printLog)console.log('solicitarCessao.result=', result);
                    result.nrtc.should.be.greaterThan(0);
                    result.wrtc.should.be.exactly('Limite disponivel');
                    result.nValor.should.be.greaterThan(0);
                    done();
                })
                .catch(error => done(error));
        });
        it('3 - Solicitar Cessão (Fornecedor) Parcelada - Fazer a reserva da cessão', (done) => {
            let dtReserva = new Date();
            dtReserva.setDate(dtReserva.getDate()  + 5);
            let params = {
                cessionario: 110108,
                estabelecimento:  110175,
                dtReservaCessao: dtReserva,
                valorReserva: 200,
                notaFiscal: null,
                diluicaoPagamento : 0,
                numeroParcelas : 4,
                valorParcelas: [50,50,50,50],
                //Não usar até ter paginação
               // maxArraySize: 1000
            }
            env.service.solicitarCessaoParcelada(params)
                .then(result => {
                    if(printLog)console.log('solicitarCessao.result=', result);
                    result.nrtc.should.be.greaterThan(0);
                    result.wrtc.should.be.exactly('Limite disponivel');
                    result.nValor.should.be.greaterThan(0);
                    done();
                })
                .catch(error => done(error));
        });
        it('4 - Cancelamento Cessão - Reprovar Reserva', (done) => {
            env.service.excluirCessao(36)
                .then(result => {
                    if(printLog)console.log('excluirCessao.result=', result);
                    result.nrtc.should.be.exactly(0);
                    result.wrtc.should.be.exactly('Cessão excluída');
                    done();
                })
                .catch(error => done(error));
        });

        it('4 - Cancelamento Cessão - Criar solicitação / Reprovar Reserva', (done) => {
            let dtReserva = new Date();
            dtReserva.setDate(dtReserva.getDate()  + 5);
            let params = {
                cessionario:  410,
                estabelecimento:  19540,
                dtReservaCessao: dtReserva,
                valorReserva: 1,
                notaFiscal: null,
                diluicaoPagamento : 0,
                //Não usar até ter paginação
               // maxArraySize: 1000
            }
            env.service.solicitarCessao(params)
                .then(result => {
                    if(printLog)console.log('solicitarCessao.result=', result);
                    result.nrtc.should.be.greaterThan(0);
                    result.wrtc.should.be.exactly('Limite disponivel');
                    result.nValor.should.be.greaterThan(0);
                    return env.service.excluirCessao(result.nrtc)
                        .then(result => {
                            if(printLog)console.log('excluirCessao.result=', result);
                            result.nrtc.should.be.exactly(0);
                            result.wrtc.should.be.exactly('Cessão excluída');
                            done();
                        })
                })
                .catch(error => done(error));
        });

        it('5 - Efetivar Cessão (EC) - Aprovar Reserva', (done) => {
            env.service.efetivarCessao(10, 'nf cessao nº 5')
                .then(result => {
                    if(printLog)console.log('efetivarCessao.result=', result);
                    result.wrtc.should.be.greaterThan(0);
                    result.wmsg.should.be.exactly('Cessão incluida');
                    done();
                })
                .catch(error => done(error));
        });

        it('5 - Efetivar Cessão (EC) - Criar Solicitação / Aprovar Reserva', (done) => {
            let dtReserva = new Date();
            dtReserva.setDate(dtReserva.getDate()  + 5);
            let params = {
                cessionario:  410,
                estabelecimento:  19540,
                dtReservaCessao: dtReserva,
                valorReserva: 1,
                notaFiscal: null,
                //Não usar até ter paginação
               // maxArraySize: 1000
            }
            env.service.solicitarCessao(params)
                .then(result => {
                    if(printLog)console.log('solicitarCessao.result=', result);
                    result.nrtc.should.be.greaterThan(0);
                    result.wrtc.should.be.exactly('Limite disponivel');
                    result.nValor.should.be.greaterThan(0);
                    return env.service.efetivarCessao(result.nrtc, 'nf cessao nº' + result.nrtc)
                        .then(result => {
                            if(printLog)console.log('efetivarCessao.result=', result);
                            result.wrtc.should.be.exactly(0);
                            result.wmsg.should.be.exactly('Cessão incluida');
                            done();
                        })
                })
                .catch(error => done(error));
        });

        it.skip('6 - Cancelamento Itens Cedidos', (done) => {
            done('NotImplemented');
        });

        it('7.3 -	Listar Cessões', (done) => {
            let params = {
                estabelecimento : null,
                fornecedor      : 410,
                dataIni         : null,
                dataFim         : null,
                status_cessao   : 1,
                cessao          : null,
                //Não usar até ter paginação
                // maxArraySize: 1000
            }
            env.service.listarCessoes(params)
                .then(result => {
                    if(printLog)console.log('listarCessoes.result=', result);
                    result.wrtc.should.be.above(0);
                    result.wmsg.should.be.exactly('Consulta concluida');
                    result.linha.should.be.an.Array;
                    (result.linha.length).should.be.above(0);
                    done();
                })
                .catch(error => done(error));
        });

        it('7.3 -	Detalhe Cessão', (done) => {
            let params = {
                estabelecimento : null,
                fornecedor      : null,
                dataIni         : null,
                dataFim         : null,
                status_cessao   : null,
                cessao          : 303,
                //Não usar até ter paginação
                // maxArraySize: 1000
            }
            env.service.listarCessoesDetalhe(params)
                .then(result => {
                    if(printLog)console.log('listarCessoesDetalhe.result=', result);
                    result.wrtc.should.be.above(0);
                    result.wmsg.should.be.exactly('Consulta concluida');
                    result.linha.should.be.an.Array;
                    (result.linha.length).should.be.above(0);
                    done();
                })
                .catch(error => done(error));
        });

        it('9 - Consulta Valor disponível de Cessão (Limite) - Valor disponível para cessão', (done) => {
            let params = {
                cessionario: 110108,
                estabelecimento:  110175,
            }
            env.service.consultarValorDisponivelCessao(params)
                .then(result => {
                    if(printLog)console.log('consultarValorDisponivelCessao.result=', result);
                    result.nrtc.should.be.exactly(0);
                    result.wrtc.should.be.exactly('Limite disponivel');
                    result.nValor.should.be.above(0);
                    done();
                })
                .catch(error => done(error));
        });
        it('9 - Consulta Valor disponível de Cessão (Limite) - Valor disponível para cessão parcelada', (done) => {
            let dtReserva = new Date();
            dtReserva.setDate(dtReserva.getDate()  + 5);
            let params = {
                cessionario: 110108,
                estabelecimento:  110175,
                dataVencimento: new Date(2018, 11, 26),
            }
            env.service.consultarValorDisponivelCessaoParcelada(params)
                .then(result => {
                    if(printLog)console.log('consultarValorDisponivelCessao.result=', result);
                    result.nrtc.should.be.exactly(0);
                    result.wrtc.should.be.exactly('Limite disponivel');
                    result.nValor.should.be.above(0);
                    done();
                })
                .catch(error => done(error));
        });
    });
    describe('Antecipações', () => {
        it.only('8 - Solicitação de Antecipação - Consultar Movimentos p/ antecipação', (done) => {
            //participanteId, mesInicio, mesFim, produtosIds, bandeirasIds, dataVendaInicio, dataVendaFim

            let params = {
                cessionario      : 110004,
                mesInicio           : new Date(2019, 0, 1),
                mesFim              : new Date(2019, 1, 28),
                produtoId         : [3,4],
                bandeirasId        : [1,2],
                dataVendaInicio     : new Date(2018, 7, 15),
                dataVendaFim        : new Date(2018, 7, 31),
                //Não usar até ter paginação
                // maxArraySize: 1000
            }
            env.service.listarMovimentosParaAntecipar(params)
                .then(result => {
                    if(printLog)console.log('listarMovimentosParaAntecipar.result=', result);
                    result.wrtc.should.be.above(0);
                    result.wmsg.should.be.exactly('Consulta concluida');
                    result.linha.should.be.an.Array;
                    (result.linha.length).should.be.above(0);
                    done();
                })
                .catch(error => done(error));
        });

        it('8 - Solicitação de Antecipação - Efetivar antecipação', (done) => {
            let params = {
                cessionario     : 110122,
                dataAntecipacao : new Date(2018,9,18),
                rowIds          : [
                    {rowId: 'AAADqEAAAAAACDGAAD'},
                    {rowId: 'AAADqEAAAAAACDbAAA'},
                ]
            }
            env.service.efetivarAntecipacao(params)
                .then(result => {
                    if(printLog)console.log('efetivarAntecipação.result=', result);
                    result.wrtc.should.be.greaterThan(0);
                    result.wmsg.should.be.exactly('Efetivacao concluida');
                    done();
                })
                .catch(error => done(error));
        });
    });
    describe('Extratos', () => {
        it('Extrato Detalhado', (done) => {
            let params = {
                participante            :100054,
                dataVendaInicial        :null,
                dataVendaFinal          :null,
                dataPagamentoInicial    :null,
                dataPagamentoFinal      :null,
                idBandeira              :null,
                statusTransacao         :null,
                statusPagamento         :null,
                tipoOperacao            :null,
                posId                   :null,
                //Não usar até ter paginação
                // maxArraySize: 1000
            }
            env.service.extratoDetalhado(params)
                .then(result => {
                    if(printLog)console.log('extratoDetalhado.result=', result);
                    result.nrtc.should.be.above(0);
                    result.wrtc.should.be.exactly('Consulta concluida');
                    result.y.should.be.an.Array;
                    (result.y.length).should.be.above(0);
                    done();
                })
                .catch(error => done(error));
        });
    });
});
