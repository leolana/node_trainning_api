let Maestro = require('maestro-io');
let di = new Maestro(`${__dirname}/../..`);
let env = {};

describe('#Dominio', function () {
    this.timeout(10000);

    before('Carregando módulos / mocks', () => {
        return di
            .loadFiles('./src/controllers/dominio'
                     , './src/environment/db'
                     , './src/environment/validator'
                     , './test/mocks/server'
                     , './test/mocks/settings-db')
            .loadDirs('./src/model')
            .provide('$internal-apis', () => Promise.resolve({}))
            .start()
            .then((di) => {
                env.db = di.resolve('$main-db');
                env.controller = di.resolve('#dominio');
                env.tiposPessoa = di.resolve('@@tipos-pessoa');

                return env.db
                    .sync({ force: true })
                    .then(() => Promise.all([
                        env.db.entities.bandeira.create({ nome: 'Visa' }),
                        env.db.entities.bandeira.create({ nome: 'Master' }),
                        env.db.entities.ramoAtividade.create({ codigo: 1, descricao: 'Restaurante', restritoPJ: false }),
                        env.db.entities.ramoAtividade.create({ codigo: 2, descricao: 'Veterinaria', restritoPJ: false })
                    ]));
            })
            .then(results => {
                env.bandeiraVisa = results[0].id;
                env.bandeiraMaster = results[1].id;
                env.ramoRestaurante = results[2].codigo;
                env.ramoVeterinaria = results[3].codigo;
                env.adesaoRestaurante = 250;
                env.adesaoPadrao = 300;
                env.taxaDebitoRestaurante = 1.5;
                env.taxasDebitoPadrao = [1.8, 2.8];

                return Promise.all([
                    env.db.entities.taxaContratual.create({
                        tipoPessoa: env.tiposPessoa.fisica,
                        ramoAtividadeCodigo: env.ramoRestaurante,
                        inicio: new Date('2018-01-01'),
                        fim: new Date('2020-01-01'),
                        adesao: env.adesaoRestaurante,
                        antecipacao: 1.8,
                        maximoParcelas: 12,
                        usuario: 'sys'
                    }),
                    env.db.entities.taxaContratual.create({
                        tipoPessoa: env.tiposPessoa.fisica,
                        inicio: new Date('2018-01-01'),
                        fim: new Date('2020-01-01'),
                        adesao: env.adesaoPadrao,
                        antecipacao: 3.8,
                        maximoParcelas: 2,
                        usuario: 'sys'
                    }),
                    env.db.entities.taxaDebito.create({
                        tipoPessoa: env.tiposPessoa.fisica,
                        ramoAtividadeCodigo: env.ramoRestaurante,
                        bandeiraId: env.bandeiraVisa,
                        inicio: new Date('2018-01-01'),
                        fim: new Date('2020-01-01'),
                        valor: env.taxaDebitoRestaurante,
                        usuario: 'sys'
                    }),
                    env.db.entities.taxaDebito.create({
                        tipoPessoa: env.tiposPessoa.fisica,
                        bandeiraId: env.bandeiraVisa,
                        inicio: new Date('2018-01-01'),
                        fim: new Date('2020-01-01'),
                        valor: env.taxasDebitoPadrao[0],
                        usuario: 'sys'
                    }),
                    env.db.entities.taxaDebito.create({
                        tipoPessoa: env.tiposPessoa.fisica,
                        bandeiraId: env.bandeiraMaster,
                        inicio: new Date('2018-01-01'),
                        fim: new Date('2020-01-01'),
                        valor: env.taxasDebitoPadrao[1],
                        usuario: 'sys'
                    }),
                    env.db.entities.taxaAdministrativa.create({
                        tipoPessoa: env.tiposPessoa.fisica,
                        ramoAtividadeCodigo: env.ramoRestaurante,
                        bandeiraId: env.bandeiraVisa,
                        inicio: new Date('2018-01-01'),
                        fim: new Date('2020-01-01'),
                        prazo: 3,
                        minimoParcelas: 1,
                        maximoParcelas: 1,
                        valor: 3.5,
                        usuario: 'sys'
                    }),
                    env.db.entities.taxaAdministrativa.create({
                        tipoPessoa: env.tiposPessoa.fisica,
                        ramoAtividadeCodigo: env.ramoRestaurante,
                        bandeiraId: env.bandeiraVisa,
                        inicio: new Date('2018-01-01'),
                        fim: new Date('2020-01-01'),
                        prazo: 3,
                        minimoParcelas: 1,
                        maximoParcelas: 1,
                        valor: 4,
                        usuario: 'sys'
                    }),
                    env.db.entities.taxaAdministrativa.create({
                        tipoPessoa: env.tiposPessoa.fisica,
                        ramoAtividadeCodigo: env.ramoRestaurante,
                        bandeiraId: env.bandeiraMaster,
                        inicio: new Date('2018-01-01'),
                        fim: new Date('2020-01-01'),
                        prazo: 3,
                        minimoParcelas: 1,
                        maximoParcelas: 1,
                        valor: 3.8,
                        usuario: 'sys'
                    }),
                    env.db.entities.taxaAdministrativa.create({
                        tipoPessoa: env.tiposPessoa.fisica,
                        ramoAtividadeCodigo: env.ramoRestaurante,
                        bandeiraId: env.bandeiraMaster,
                        inicio: new Date('2018-01-01'),
                        fim: new Date('2020-01-01'),
                        prazo: 3,
                        minimoParcelas: 1,
                        maximoParcelas: 1,
                        valor: 5,
                        usuario: 'sys'
                    }),
                    env.db.entities.taxaAdministrativa.create({
                        bandeiraId: env.bandeiraVisa,
                        inicio: new Date('2018-01-01'),
                        fim: new Date('2020-01-01'),
                        prazo: 14,
                        minimoParcelas: 1,
                        maximoParcelas: 1,
                        valor: 4.5,
                        usuario: 'sys'
                    }),
                    env.db.entities.taxaAdministrativa.create({
                        bandeiraId: env.bandeiraVisa,
                        inicio: new Date('2018-01-01'),
                        fim: new Date('2020-01-01'),
                        prazo: 14,
                        minimoParcelas: 1,
                        maximoParcelas: 1,
                        valor: 5,
                        usuario: 'sys'
                    }),
                    env.db.entities.taxaAdministrativa.create({
                        bandeiraId: env.bandeiraMaster,
                        inicio: new Date('2018-01-01'),
                        fim: new Date('2020-01-01'),
                        prazo: 14,
                        minimoParcelas: 1,
                        maximoParcelas: 1,
                        valor: 4.8,
                        usuario: 'sys'
                    }),
                    env.db.entities.taxaAdministrativa.create({
                        bandeiraId: env.bandeiraMaster,
                        inicio: new Date('2018-01-01'),
                        fim: new Date('2020-01-01'),
                        prazo: 14,
                        minimoParcelas: 1,
                        maximoParcelas: 1,
                        valor: 6,
                        usuario: 'sys'
                    }),
                ]);
            });
    });

    describe('[GET] Taxas', () => {
        it('Deve retornar as taxas de credenciamento, débito e administrativas.', (done) => {
            let req = {
                query: {
                    tipoPessoa: env.tiposPessoa.fisica,
                    ramoAtividade: env.ramoRestaurante
                }
            };
            let res = {
                catch: (error) => done(error),
                send: (result) => {
                    result.contratual.should.has.property('adesao');
                    result.contratual.should.has.property('antecipacao');
                    result.contratual.should.has.property('maximoParcelas');
                    result.should.has.property('debito');
                    result.should.has.property('administrativas');

                    result.contratual.adesao.should.be.exactly(env.adesaoRestaurante);

                    result.debito.should.has.property('length');
                    result.debito[0].valor.should.be.exactly(env.taxaDebitoRestaurante);
                    result.debito[1].valor.should.be.exactly(env.taxasDebitoPadrao[1]);

                    result.administrativas.should.has.property('length');
                    result.administrativas.length.should.be.exactly(2);

                    done();
                }
            };

            env.controller.obterOpcoesTaxas(req, res);
        });

        it('Deve retornar as taxas padrão quando a chave não existir', (done) => {
            let req = {
                query: {
                    tipoPessoa: env.tiposPessoa.fisica,
                    ramoAtividade: env.ramoVeterinaria
                }
            };
            let res = {
                catch: (error) => done(error),
                send: (result) => {

                    result.contratual.should.has.property('adesao');
                    result.contratual.should.has.property('antecipacao');
                    result.contratual.should.has.property('maximoParcelas');
                    result.should.has.property('debito');
                    result.should.has.property('administrativas');

                    result.contratual.adesao.should.be.exactly(env.adesaoPadrao);

                    result.debito.should.has.property('length');
                    result.debito[0].valor.should.be.exactly(env.taxasDebitoPadrao[0]);
                    result.debito[1].valor.should.be.exactly(env.taxasDebitoPadrao[1]);

                    result.administrativas.should.has.property('length');
                    result.administrativas.length.should.be.exactly(1);

                    done();
                }
            };

            env.controller.obterOpcoesTaxas(req, res);
        });
    });
});
