let Maestro = require('maestro-io');
let di = new Maestro(`${__dirname}/../..`);
let env = {};

describe('#Credenciamento', () => {
    before('Carregando módulos / mocks', () => {
        return di
            .loadFiles('./src/controllers/credenciamento'
                , './src/environment/db'
                , './src/environment/validator'
                , './test/mocks/file-storage'
                , './test/mocks/server'
                , './test/mocks/settings-db')
            .loadDirs('./src/model')
            .start()
            .then((di) => {
                env.db = di.resolve('$main-db');
                env.controller = di.resolve('#credenciamento');
                env.status = di.resolve('@@credenciamento-status');
                env.tiposPessoa = di.resolve('@@tipos-pessoa');
                env.tiposCaptura = di.resolve('@@tipos-captura');
                env.credenciamentoStatus = di.resolve('@@credenciamento-status')

                env.existentDocumento = '111.111.111-11';
                env.existentCode = 1;
                env.existentCredenciamento = 1;
                env.banco = { id: '246', text: 'Banco ABC Brasil S.A.' };

                env.userDefault = 'admin';
                let now = new Date();
                env.today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                return env.db
                    .sync({ force: true })
                    .then(() => {

                        let taxasPorBandeirasPromises = (bandeira) => Promise.all([
                            env.db.entities.taxaDebito.create({
                                bandeiraId: env.existentCode,
                                inicio: env.today,
                                valor: 1.8,
                                usuario: env.userDefault
                            }),
                            env.db.entities.taxaAdministrativa.create({
                                bandeiraId: env.existentCode,
                                inicio: env.today,
                                prazo: 3,
                                minimoParcelas: 1,
                                maximoParcelas: 1,
                                valor: 4.5,
                                usuario: env.userDefault
                            }),
                            env.db.entities.taxaAdministrativa.create({
                                bandeiraId: env.existentCode,
                                inicio: env.today,
                                prazo: 3,
                                minimoParcelas: 2,
                                maximoParcelas: 3,
                                valor: 4.7,
                                usuario: env.userDefault
                            }),
                            env.db.entities.taxaAdministrativa.create({
                                bandeiraId: env.existentCode,
                                inicio: env.today,
                                prazo: 3,
                                minimoParcelas: 7,
                                maximoParcelas: 12,
                                valor: 5.2,
                                usuario: env.userDefault
                            }),
                            env.db.entities.taxaAdministrativa.create({
                                bandeiraId: env.existentCode,
                                inicio: env.today,
                                prazo: 14,
                                minimoParcelas: 1,
                                maximoParcelas: 1,
                                valor: 3.5,
                                usuario: env.userDefault
                            }),
                            env.db.entities.taxaAdministrativa.create({
                                bandeiraId: env.existentCode,
                                inicio: env.today,
                                prazo: 14,
                                minimoParcelas: 2,
                                maximoParcelas: 6,
                                valor: 3.7,
                                usuario: env.userDefault
                            }),
                            env.db.entities.taxaAdministrativa.create({
                                bandeiraId: env.existentCode,
                                inicio: env.today,
                                prazo: 14,
                                minimoParcelas: 7,
                                maximoParcelas: 12,
                                valor: 4.2,
                                usuario: env.userDefault
                            }),
                            env.db.entities.taxaAdministrativa.create({
                                bandeiraId: env.existentCode,
                                inicio: env.today,
                                prazo: 33,
                                minimoParcelas: 1,
                                maximoParcelas: 1,
                                valor: 2.5,
                                usuario: env.userDefault
                            }),
                            env.db.entities.taxaAdministrativa.create({
                                bandeiraId: env.existentCode,
                                inicio: env.today,
                                prazo: 33,
                                minimoParcelas: 2,
                                maximoParcelas: 6,
                                valor: 2.7,
                                usuario: env.userDefault
                            }),
                            env.db.entities.taxaAdministrativa.create({
                                bandeiraId: env.existentCode,
                                inicio: env.today,
                                prazo: 33,
                                minimoParcelas: 7,
                                maximoParcelas: 12,
                                valor: 3.2,
                                usuario: env.userDefault
                            })
                        ]);


                        return Promise.all([
                            env.db.entities.ramoAtividade.upsert({ codigo: env.existentCode, descricao: 'Veterinaria', restritoPJ: false }),
                            env.db.entities.bandeira.upsert({ id: env.existentCode, nome: 'Mastercard' }).then(taxasPorBandeirasPromises),
                            env.db.entities.cidade.upsert({ id: env.existentCode, nome: 'São Paulo', estado: 'SP' }),
                            env.db.entities.faturamentoCartao.upsert({ id: env.existentCode, descricao: 'Até R$ 10.000' }),
                            env.db.entities.ticketMedio.upsert({ id: env.existentCode, descricao: 'Até R$ 10' }),
                            env.db.entities.taxaContratual.upsert({
                                id: env.existentCode,
                                inicio: env.today,
                                antecipacao: 1.8,
                                adesao: 250,
                                maximoParcelas: '12',
                                usuario: env.userDefault
                            }),
                            env.db.entities.produto.upsert({ id: env.existentCode, nome: 'POS com Fio', usuario: env.userDefault })
                                .then(produto => env.db.entities.captura.upsert({
                                    id: env.existentCode,
                                    produtoId: env.existentCode,
                                    inicio: env.today,
                                    tipoCaptura: env.tiposCaptura.aluguel,
                                    valor: 55,
                                    usuario: env.userDefault
                                }))
                            ]).then(() => Promise.all([
                                env.db.entities.credenciamentoProposta.create({
                                    tipoPessoa: env.tiposPessoa.fisica,
                                    documento: env.existentDocumento,
                                    nome: 'Walter Kovacs',
                                    arquivos: {
                                        identidade: 'http://',
                                        fichaCadastro: 'http://',
                                        comprovanteDeResidencia: 'http://',
                                        extratosBancarios: ['http://']
                                    }
                                }),
                                env.db.entities.credenciamentoProposta.create({
                                    tipoPessoa: env.tiposPessoa.fisica,
                                    documento: '222.222.222-22',
                                    nome: 'Lester Burnham',
                                    arquivos: {
                                        identidade: 'http://',
                                        fichaCadastro: 'http://',
                                        comprovanteDeResidencia: 'http://',
                                        extratosBancarios: ['http://']
                                    }
                                }),
                                env.db.entities.credenciamento.create({
                                    nome: 'World Radio',
                                    tipoPessoa: env.tiposPessoa.juridica,
                                    ramoAtividadeCodigo: env.existentCode,
                                    documento: '5176438668686578',
                                    aberturaNascimento: new Date(2002, 01, 15),
                                    telefone: '6317773472',
                                    cep: '11735',
                                    logradouro: 'Grove Street',
                                    numero: '2876',
                                    complemento: '',
                                    bairro: 'Farmingdale',
                                    cidadeId: env.existentCode,
                                    faturamentoCartaoId: env.existentCode,
                                    ticketMedioId: env.existentCode,
                                    ecommerce: 'https://www.budgetgranite.com',
                                    taxaContratualId: env.existentCode,
                                    usuario: 'admin',
                                    razaoSocial: 'World Radio',
                                    inscricaoEstadual: '3972625876',
                                    inscricaoMunicipal: '98258949',
                                    instalacao: {
                                        cep: '11735',
                                        logradouro: 'Grove Street',
                                        numero: '11735',
                                        complemento: '',
                                        bairro: 'Farmingdale',
                                        cidadeId: env.existentCode,
                                        dias: 1,
                                        horario: '10:00',
                                    },
                                    contato: {
                                        nome: 'Steven S. Kittleson',
                                        email: 'StevenSKittleson@teleworm.us',
                                        telefone: '6317773472',
                                        celular: '6317773472',
                                    },
                                    taxasAdministrativas: [{ taxaAdministrativaId: env.existentCode }],
                                    taxasDebito: [{ taxaDebitoId: env.existentCode }],
                                    capturas: [{
                                        capturaId: 1,
                                        quantidade: 2
                                    }],
                                    domiciliosBancarios: [{
                                        bandeiraId: 1,
                                        bancoId: env.banco.id,
                                        bancoNome: env.banco.text,
                                        agencia: '123',
                                        conta: '123',
                                        digito: '1'
                                    }],
                                    historicoAprovacao: [{
                                        status: env.credenciamentoStatus.pendente,
                                        usuario: 'admin',
                                        observacao: ''
                                    }],
                                    arquivos: {
                                        contratoSocial: 'http://',
                                        extratosBancarios: ['http://'],
                                        analises: []
                                    }
                                }, {
                                    include: [
                                        { model: env.db.entities.credenciamentoDomicilioBancario, as: 'domiciliosBancarios' },
                                        { model: env.db.entities.credenciamentoCaptura, as: 'capturas' },
                                        { model: env.db.entities.credenciamentoInstalacao, as: 'instalacao' },
                                        { model: env.db.entities.credenciamentoContato, as: 'contato' },
                                        { model: env.db.entities.credenciamentoTaxaAdministrativa, as: 'taxasAdministrativas' },
                                        { model: env.db.entities.credenciamentoTaxaDebito, as: 'taxasDebito' },
                                        { model: env.db.entities.credenciamentoAprovacao, as: 'historicoAprovacao' },
                                    ]
                                })
                            ]))
                    });
            });
    });

    describe('[GET]', () => {
        it('Deve retornar todos os pré-credenciamentos quando filtro de status não estiver presente.', (done) => {
            let req = { query: {} };
            let res = {
                catch: (error) => done(error),
                send: (result) => {
                    result.should.has.property('length');
                    result.length.should.be.exactly(2);
                    done();
                }
            };

            env.controller.procurar(req, res);
        });

        it('Deve retornar todos os credenciamentos que satisfaçam o filtro de status.', (done) => {
            let req = {
                query: { status: env.status.pendente }
            };
            let res = {
                catch: (error) => done(error),
                send: (result) => {
                    result.should.has.property('length');
                    result.length.should.be.exactly(1);
                    done();
                }
            };

            env.controller.procurar(req, res);
        });

        it('Deve retornar um credenciamento completo de um id específico', (done) => {
            let req = {
                params: { id: env.existentCredenciamento }
            };
            let res = {
                catch: (error) => done(error),
                send: (result) => {
                    result.should.has.property('id');
                    done();
                }
            };

            env.controller.obter(req, res);
        });
    });

    describe.skip('[POST] Adicionar Proposta', () => {
        it('Deve criar um novo pré-credenciamento.', (done) => {
            let req = {
                body: {
                    tipoPessoa: env.tiposPessoa.fisica,
                    documento: '111.222.333-96',
                    nome: 'Fausto Silva'
                },
                files: {
                    identidade: { name: 'upload-file.txt', path: './test/fake-data/upload-file.txt' },
                    fichaCadastro: { name: 'upload-file.txt', path: './test/fake-data/upload-file.txt' },
                    comprovanteDeResidencia: { name: 'upload-file.txt', path: './test/fake-data/upload-file.txt' },
                    extratoBancario_0: { name: 'upload-file.txt', path: './test/fake-data/upload-file.txt' }
                }
            };
            let res = {
                catch: (error) => done(error),
                end: () => {
                    env.db.entities.credenciamentoProposta
                        .findOne({
                            where: { documento: req.body.documento }
                        })
                        .then((credenciamento) => {
                            credenciamento.should.be.ok;
                            credenciamento.should.has.property('id');
                            done();
                        })
                        .catch(error => done(error));
                }
            };

            env.controller.adicionarProposta(req, res);
        });

        it('Deve retornar o erro Pre-Credenciamento-Existente se houver outro registro com o mesmo "documento".', (done) => {
            let req = {
                body: {
                    tipoPessoa: env.tiposPessoa.fisica,
                    documento: env.existentDocumento,
                    nome: 'Fausto Silva',
                    arquivos: {
                        identidade: 'http://',
                        fichaCadastro: 'http://',
                        comprovanteDeResidencia: 'http://',
                        extratosBancarios: ['http://']
                    }
                }
            };
            let res = {
                end: () => done('res.end called!'),
                catch: (error) => {
                    error.should.be.exactly('pre-credenciamento-existente');
                    done();
                }
            };

            env.controller.adicionarProposta(req, res);
        })
    });

    describe('[POST] Adicionar Credenciamento.', () => {
        it('Deve criar um novo credenciamento PF e seu status deve ser PENDENTE.', (done) => {
            let req = {
                files: {
                    identidade: { name: 'upload-file.txt', path: './test/fake-data/upload-file.txt' },
                    comprovanteDeResidencia: { name: 'upload-file.txt', path: './test/fake-data/upload-file.txt' },
                    extratoBancario_0: { name: 'upload-file.txt', path: './test/fake-data/upload-file.txt' }
                },
                user: {
                    email: env.userDefault
                },
                body: {
                    data: JSON.stringify({
                        tipoPessoa: env.tiposPessoa.fisica,
                        nomeMae: 'Pamela T. Robertson',
                        taxaContratualId: env.existentCode,
                        dadosCadastrais: {
                            nome: 'Alize Hudson',
                            ramoAtividadeCodigo: env.existentCode,
                            documento: env.existentDocumento,
                            aberturaNascimento: new Date(1982, 02, 27),
                            telefone: '7755879174',
                            cep: '89501',
                            logradouro: 'Sheila Lane',
                            complemento: '',
                            numero: '70',
                            bairro: 'Reno',
                            cidadeId: env.existentCode,
                            informacoesFinanceiras:{
                                faturamentoAnual: {
                                    id: env.existentCode
                                },
                                ticketMedio: {
                                    id: env.existentCode,
                                }
                            },
                            domiciliosBancarios: [{
                                bandeira: {id: env.existentCode},
                                banco: env.banco, 
                                agencia: '123',
                                conta: '123',
                                digito: '1'
                            }],
                        },
                        captura : {
                            url: 'truthisintheair.com',
                            capturas: [{
                                id: env.existentCode,
                                quantidade: 2
                            }],
                        },
                        instalacao: {
                            cep: "04533010",
                            logradouro: "Rua Tabapuã",
                            numero: "145",
                            complemento: "bloco unico",
                            bairro: "Itaim Bibi",
                            cidade: env.existentCode,
                            dias: 1,
                            horario: "10:00",
                            nome: "Wilfrid Luettgen",
                            email: "Wilfrid.Luettgen75@gmail.com",
                            telefone: "716-9857",
                            celular: "534-90107",
                        },
                        condicaoComercial : {
                            taxaContratual: env.existentCode,
                            taxasAdministrativas: [env.existentCode],
                            taxasDebito: [env.existentCode]
                        }
                    })
                }
            };

            let res = {
                catch: (error) => done(error),
                end: () => {
                    env.db.entities.credenciamento
                        .findOne({
                            where: { documento: env.existentDocumento },
                            include: [{ model: env.db.entities.credenciamentoAprovacao, as: 'historicoAprovacao', required: true }],
                        })
                        .then((credenciamento) => {
                            credenciamento.should.be.ok;
                            credenciamento.should.has.property('id');
                            credenciamento.historicoAprovacao.should.containDeep([{ status: env.credenciamentoStatus.pendente }]);
                            done();
                        })
                        .catch(error => done(error));
                }
            };

            env.controller.adicionarCredenciamento(req, res);
        });

        it('Deve criar um novo credenciamento PJ e seu status deve ser PENDENTE.', (done) => {
            let req = {
                files: {
                    contratoSocial: { name: 'upload-file.txt', path: './test/fake-data/upload-file.txt' },
                    extratoBancario_0: { name: 'upload-file.txt', path: './test/fake-data/upload-file.txt' }
                },
                user: {
                    email: env.userDefault
                },
                body: {
                    data: JSON.stringify({
                        nome: "It Lab",
                        tipoPessoa: env.tiposPessoa.juridica,
                        ramoAtividadeCodigo: env.existentCode,
                        documento: "01510345000158",
                        aberturaNascimento: new Date(2002, 01, 15),
                        telefone: "1111223344",
                        cep: "04533010",
                        logradouro: "Rua Tabapuã",
                        numero: "145",
                        complemento: "bloco unico",
                        bairro: "Itaim Bibi",
                        cidadeId: env.existentCode,
                        faturamentoCartaoId: env.existentCode,
                        ticketMedioId: env.existentCode,
                        ecommerce: "https://www.itlab.com.br",
                        taxaContratualId: env.existentCode,
                        usuario: "eduardo.silva",
                        razaoSocial: "It Lab Consultoria e Desenvolvimento de Sistemas LTDA.",
                        inscricaoEstadual: "287.046.269.490",
                        inscricaoMunicipal: "227.616.175.362",
                        instalacao: {
                            cep: "04533010",
                            logradouro: "Rua Tabapuã",
                            numero: "145",
                            complemento: "bloco unico",
                            bairro: "Itaim Bibi",
                            cidadeId: env.existentCode,
                            dias: 1,
                            horario: "10:00",
                            nome: "Wilfrid Luettgen",
                            email: "Wilfrid.Luettgen75@gmail.com",
                            telefone: "716-9857",
                            celular: "534-90107",
                        },
                        taxasAdministrativas: [env.existentCode],
                        taxasDebito: [env.existentCode],
                        capturas: [{
                            capturaId: env.existentCode,
                            quantidade: 2
                        }],
                        domiciliosBancarios: [{
                            bandeiraId: env.existentCode,
                            bancoId: env.banco.id,
                            bancoNome: env.banco.text,
                            agencia: '123',
                            conta: '123',
                            digito: '1'
                        }]
                    })
                }
            };

            let res = {
                catch: (error) => done(error),
                end: () => {
                    env.db.entities.credenciamento
                        .findOne({
                            where: { documento: env.existentDocumento },
                            include: [{ model: env.db.entities.credenciamentoAprovacao, as: 'historicoAprovacao', required: true }],
                        })
                        .then((credenciamento) => {
                            credenciamento.should.be.ok;
                            credenciamento.should.has.property('id');
                            credenciamento.historicoAprovacao.should.containDeep([{ status: env.credenciamentoStatus.pendente }]);
                            done();
                        })
                        .catch(error => done(error));
                }
            };

            env.controller.adicionarCredenciamento(req, res);
        });
    });

    describe.skip('[POST] Adicionar Status de Aprovação.', () => {
        it('Deve criar um novo registro no histórico de aprovação do credenciamento.', (done) => { });

        it('Deve inativar o credenciamento ativo (caso exista) quando o novo status for APROVADO.', (done) => { });
    });

    describe('[POST] Adicionar arquivo de análise no credenciamento.', () => {
        it('Deve adicionar um novo arquivo para o credenciamento', (done) => {
            let req = {
                files: {
                    analise: { name: 'upload-file.txt', path: './test/fake-data/upload-file.txt' },
                },
                user: {
                    email: env.userDefault
                },
                params: {
                    id: env.existentCredenciamento
                },
                body: {
                    observacao: 'Um novo arquivo de análise'
                }
            };

            let res = {
                catch: (error) => done(error),
                end: () => {
                    env.db.entities.credenciamento
                        .findOne({
                            where: { id: env.existentCredenciamento },
                        })
                        .then((credenciamento) => {
                            credenciamento.should.be.ok;
                            credenciamento.should.has.property('id');
                            credenciamento.arquivos.analises.length.should.be.exactly(1)
                            done();
                        })
                        .catch(error => done(error));
                }
            };

            env.controller.adicionarArquivoAnalise(req, res);
        });
    });
});
