let Maestro = require('maestro-io');
var should = require('should');
let di = new Maestro(`${__dirname}/../..`);
let env = {};

describe('#Fornecedor', () => {
    before('Carregando módulos / mocks', () => {
        return di
            .loadFiles('./src/controllers/fornecedores'
                , './src/environment/db'
                , './src/environment/validator'
                , './src/environment/mailer/emailTemplates'
                , './test/mocks/file-storage'
                , './test/mocks/server'
                , './test/mocks/settings-db'
                , './test/mocks/auth'
                , './test/mocks/siscof-wrapper'
                , './test/mocks/mailer'
                , './test/mocks/settings'
                , './src/app-dev-seed')
            .loadDirs('./src/model')
            .start()
            .then((di) => {
                env.db = di.resolve('$main-db');
                env.controller = di.resolve('#fornecedores');
                env.indicacaoStatus = di.resolve('@@participante-indicacao-status');

                const seed = di.resolve('$seed');

                return env.db.sync({ force: true })
                    .then(() => Promise.all([
                        seed.bandeiras(),
                        seed.ramoAtividades(),
                        seed.cidades(),
                        seed.faturamentoCartao(),
                        seed.ticketMedio(),
                        seed.taxaContratual(),
                        seed.produtos(),
                        seed.eventos()
                    ]))
                    .then(() => seed.taxas())
                    .then(() => seed.credenciamentos());
            });
    });

    describe('[POST] recusar indicação', () => {
        it('Deve alterar o status da indicação do estabelecimento para recusado', (done) => {
            let req = {
                user: {
                    email: 'teste@alpe.com.br',
                },
                body: {
                    motivo: 'teste',
                    documento: '13769015000160'
                }
            };

            let res = {
                catch: (error) => done(error),
                end: () => {
                    env.db.entities.participanteIndicacao.findOne({ where: { documento: req.body.documento } })
                    .then(indicacao => {
                        indicacao.status.should.be.exactly(env.indicacaoStatus.reprovado);
                        done();
                    });
                }
            };

            env.controller.recusarIndicacao(req, res);
        });
    });
});
