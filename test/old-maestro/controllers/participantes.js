let Maestro = require('maestro-io');
let di = new Maestro(`${__dirname}/../..`);
let env = {};

describe('#Participante', () => {
    before('Carregando módulos / mocks', () => {
        return di
            .loadFiles('./src/controllers/participantes'
                , './src/environment/db'
                , './src/environment/validator'
                , './test/mocks/file-storage'
                , './test/mocks/server'
                , './test/mocks/settings-db')
            .loadDirs('./src/model')
            .start()
            .then((di) => {
                env.db = di.resolve('$main-db');
                env.controller = di.resolve('#participantes');
                env.tiposPessoa = di.resolve('@@tipos-pessoa');

                env.existentCode = 1;
                env.existentDocument = '01510345000158';
                env.existentInactiveDocument = '12365488000';

                return env.db.sync({ force: true });
            })
            .then(() => Promise.all([
                env.db.entities.ramoAtividade.upsert({ codigo: env.existentCode, descricao: 'Veterinaria', restritoPJ: false }),
                env.db.entities.cidade.upsert({ id: env.existentCode, nome: 'São Paulo', estado: 'SP' })
            ]))
            .then(results => Promise.all([
                env.db.entities.participante.create({
                    tipoPessoa: env.tiposPessoa.juridica,
                    ramoAtividadeCodigo: env.existentCode,
                    documento: env.existentDocument,
                    nome: 'It Lab',
                    aberturaNascimento: new Date(2002, 01, 15),
                    telefone: '1111223344',
                    cep: '04533010',
                    logradouro: 'Rua Tabapuã',
                    numero: '145',
                    complemento: 'bloco unico',
                    bairro: 'Itaim Bibi',
                    cidadeId: env.existentCode,
                    razaoSocial: 'It Lab Consultoria e Desenvolvimento de Sistemas LTDA.',
                    inscricaoEstadual: '287.046.269.490',
                    inscricaoMunicipal: '227.616.175.362',
                    ativo: true,
                    usuario: 'admin'
                }),
                env.db.entities.participante.create({
                    tipoPessoa: env.tiposPessoa.juridica,
                    ramoAtividadeCodigo: env.existentCode,
                    documento: env.existentInactiveDocument,
                    nome: 'Sam Goody',
                    aberturaNascimento: new Date(2002, 01, 15),
                    telefone: '3132952726',
                    cep: '48180',
                    logradouro: 'Prudence Street',
                    numero: '2093',
                    complemento: '',
                    bairro: 'Taylor',
                    cidadeId: env.existentCode,
                    razaoSocial: 'Sam Goody LTDA.',
                    inscricaoEstadual: '5505.3953.7918',
                    inscricaoMunicipal: '5205.5077.7694',
                    ativo: false,
                    usuario: 'admin'
                })
            ]))
            .then(participantes => {
                return env.db.entities.participante.create({
                    tipoPessoa: env.tiposPessoa.juridica,
                    ramoAtividadeCodigo: env.existentCode,
                    documento: '448555799298',
                    nome: 'KG Menswear',
                    aberturaNascimento: new Date(1985, 07, 13),
                    telefone: '2017888135',
                    cep: '07304',
                    logradouro: 'Desert Broom Court',
                    numero: '1138',
                    complemento: '',
                    bairro: 'Jersey City',
                    cidadeId: env.existentCode,
                    razaoSocial: 'KG Menswear LTDA.',
                    inscricaoEstadual: '4485.5579.9298',
                    inscricaoMunicipal: '5399.1521.6999',
                    ativo: true,
                    usuario: 'admin',
                    fornecedores: {
                        fornecedorId: participantes[0].id,
                        exibeValorDisponivel: false,
                        diasAprovacao: 5,
                        usuario: 'admin'
                    },
                    indicacoes: {
                        documento: '01510345000158',
                        usuario: 'admin'
                    }
                }, {
                    include: [
                        { model: env.db.entities.participanteVinculo, as: 'fornecedores' },
                        { model: env.db.entities.participanteIndicacao, as: 'indicacoes' }
                    ]
                });
            });
    });

    describe('[GET] obter dados de fornecedor', () => {
        it('Deve retornar os dados do fornecedor conforme cnpj informado.', (done) => {
            let req = {
                params: {
                    documento: env.existentDocument
                }
            };
            let res = {
                catch: (error) => done(error),
                send: (result) => {
                    result.should.has.property('id');
                    done();
                }
            };

            env.controller.procurarFornecedor(req, res);
        });

        it('Deve retornar o erro Fornecedor-Nao-Encontrado caso o documento informado não exista.', (done) => {
            let req = {
                params: {
                    documento: 'abc123'
                }
            };
            let res = {
                send: () => done('res.send called!'),
                catch: (error) => {
                    error.should.be.exactly('fornecedor-nao-encontrado');
                    done();
                }
            };

            env.controller.procurarFornecedor(req, res);
        });

        it('Deve retornar o erro Fornecedor-Nao-Encontrado caso o participante esteja INATIVO.', (done) => {
            let req = {
                params: {
                    documento: env.existentInactiveDocument
                }
            };
            let res = {
                send: () => done('res.send called!'),
                catch: (error) => {
                    error.should.be.exactly('fornecedor-nao-encontrado');
                    done();
                }
            };

            env.controller.procurarFornecedor(req, res);
        });
    });

    describe.skip('[POST] Criar indicação de fornecedor', () => {
        it('Deve criar uma nova indicação de fornecedor pelo estabelecimento comercial', (done) => {
            let req = {
                user: {
                    email: 'admin'
                },
                body: {
                    estabelecimentoComercialId: 1,
                    documento: "01510345000158",
                }
            };
            let res = {
                catch: (error) => done(error),
                end: (result) => {
                    env.db.entities.participanteIndicacao.findOne({
                        where: {
                            participanteId: 1,
                            documento: "01510345000158"
                        }
                    }).then(participanteIndicacao => {
                        participanteIndicacao.should.be.ok;
                        participanteIndicacao.should.has.property('id');
                        done();
                    }).catch(error => done(error));
                }
            };

            env.controller.indicarFornecedor(req, res);
        });

        it('Deve retornar um erro quando indicar fornecedor a um estabelecimento comercial inativo', (done) => {
            let req = {
                user: {
                    email: 'admin'
                },
                body: {
                    estabelecimentoComercialId: 2,
                    documento: "01510345000158",
                }
            };
            let res = {
                catch: (error) => done(),
                end: (result) => done('error!!!')
            };

            env.controller.indicarFornecedor(req, res);
        });

        it('Deve retornar um erro quando vinculo fornecedor a um estabelecimento comercial já vinculados', (done) => {
            let req = {
                user: {
                    email: 'admin'
                },
                body: {
                    estabelecimentoComercialId: 3,
                    documento: "01510345000158",
                }
            };
            let res = {
                catch: (error) => done(),
                end: (result) => done('error!!!')
            };

            env.controller.indicarFornecedor(req, res);
        });

    });

    describe.skip('[POST] Criar vinculo entre estabelecimento comercial e fornecedor', () => {
        it('Deve criar um novo vinculo entre estabelecimento comercial e fornecedor ', (done) => {
            let req = {
                user: {
                    email: 'admin'
                },
                body: {
                    estabelecimentoComercialId: 1,
                    fornecedorId: 3,
                }
            };
            let res = {
                catch: (error) => done(error),
                end: (result) => {
                    env.db.entities.participanteVinculo.findOne({
                        where: {
                            estabelecimentoComercialId: 1,
                            fornecedorId: 3
                        }
                    }).then(participanteVinculo => {
                        participanteVinculo.should.be.ok;
                        participanteVinculo.should.has.property('id');
                        done();
                    }).catch(error => done(error));

                }
            };

            env.controller.vincularFornecedor(req, res);
        });
        it('Deve retornar um erro quando vinculo fornecedor inativo a um estabelecimento comercial ', (done) => {
            let req = {
                user: {
                    email: 'admin'
                },
                body: {
                    estabelecimentoComercialId: 1,
                    fornecedorId: 2,
                }
            };
            let res = {
                catch: (error) => done(),
                end: (result) => done('error!!!')
            };

            env.controller.vincularFornecedor(req, res);
        });
        it('Deve retornar um erro quando vinculo fornecedor a um estabelecimento comercial inativo', (done) => {
            let req = {
                user: {
                    email: 'admin'
                },
                body: {
                    estabelecimentoComercialId: 2,
                    fornecedorId: 1,
                }
            };
            let res = {
                catch: (error) => done(),
                end: (result) => done('error!!!')
            };

            env.controller.vincularFornecedor(req, res);
        });
        it('Deve retornar um erro quando vinculo fornecedor inexistente a um estabelecimento comercial', (done) => {
            let req = {
                user: {
                    email: 'admin'
                },
                body: {
                    estabelecimentoComercialId: 2,
                    fornecedorId: -1,
                }
            };
            let res = {
                catch: (error) => done(),
                end: (result) => done('error!!!')
            };

            env.controller.vincularFornecedor(req, res);
        });
        it('Deve retornar um erro quando vinculo fornecedor a um estabelecimento comercial inexistente', (done) => {
            let req = {
                user: {
                    email: 'admin'
                },
                body: {
                    estabelecimentoComercialId: 2,
                    fornecedorId: -1,
                }
            };
            let res = {
                catch: (error) => done(),
                end: (result) => done('error!!!')
            };

            env.controller.vincularFornecedor(req, res);
        });
        it('Deve retornar um erro quando vinculo fornecedor a um estabelecimento comercial já vinculados', (done) => {
            let req = {
                user: {
                    email: 'admin'
                },
                body: {
                    estabelecimentoComercialId: 3,
                    fornecedorId: 1,
                }
            };
            let res = {
                catch: (error) => done(),
                end: (result) => done('error!!!')
            };

            env.controller.vincularFornecedor(req, res);
        });
    });


});
