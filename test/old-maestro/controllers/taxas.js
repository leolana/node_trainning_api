let Maestro = require('maestro-io');
var should = require('should');
let di = new Maestro(`${__dirname}/../..`);
let env = {};

describe('#Taxa', () => {
    before('Carregando módulos / mocks', () => {
        return di
            .loadFiles('./src/controllers/taxas'
                , './src/environment/db'
                , './src/environment/validator'
                , './test/mocks/file-storage'
                , './test/mocks/server'
                , './test/mocks/settings-db'
                , './src/app-dev-seed')
            .loadDirs('./src/model')
            .start()
            .then((di) => {
                env.db = di.resolve('$main-db');
                env.controller = di.resolve('#taxas');

                const seed = di.resolve('$seed');

                return env.db.sync({ force: true })
                    .then(() => Promise.all([
                        seed.bandeiras(),
                        seed.taxaContratual(),
                        seed.eventos(),
                        seed.faturamentoCartao(),
                    ]))
                    .then(() => Promise.all([seed.taxas()]));
            });
    });

    describe('[GET] obter taxas para credenciamento', () => {
        it('Deve retornar os dados da taxa conforme faturamento informato.', (done) => {
            let req = {
                query: {
                    tipoPessoa: 1,
                    ramoAtividade: 1,
                    faturamentoCartao: 1
                }
            };
            let res = {
                catch: (error) => done(error),
                send: (result) => {
                    result.should.has.property('administrativas');
                    result.should.has.property('debito');
                    result.should.has.property('contratual');
                    done();
                }
            };

            env.controller.obterOpcoesTaxas(req, res);
        });
    });
});
