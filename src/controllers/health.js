let request = require('request-promise-native');

module.exports = di => {
    di.provide('#health', '$main-db', '$siscof-connector', '$auth', '@@credenciamento-status', '$mailer', '@@email-templates',
    (db, siscof, auth, statusCredenciamento, mailer, emailTemplates) => Promise.resolve({
        testPostgresConnection: (req, res) => {
            db
                .query("SELECT 1;")
                .then(result => res.send({ result: true }))
                .catch(error => res.send({ result: false, error: error }));
        },
        testOracleConnection: (req, res) => {
            siscof.executeCommand(
                "SELECT PARAMETER, VALUE FROM nls_session_parameters \
                UNION \
                SELECT PARAMETER, VALUE FROM v$nls_parameters \
                WHERE PARAMETER IN ('NLS_LANGUAGE', 'NLS_CHARACTERSET') \
                ORDER BY 1"
            ,[])
            .then(result => res.send({ result: true, rows: result.rows }))
            .catch(error => res.send({ result: false, error: error }));
        },
        testKeyCloakAccess: (req, res) => {
            auth
                .authenticateAsAdmin()
                .then(result => res.send({ result: true }))
                .catch(error => res.send({ result: false, error: error }));
        },
        testMailer: (req, res) => {
            mailer.enviar({
                templateName: emailTemplates.EMAIL_TESTE,
                destinatary: req.body.to,
                substitutions: { }
            })
            .then(result => res.send({ result: true }))
            .catch(error => res.send({ result: false, error: error }));
        },
        getStatusCredenciamentos: (req, res) => {
            Promise.all([
                db.entities.credenciamento.findAll({
                    limit: 1,
                    attributes: ['createdAt'],
                    where: {
                        status: statusCredenciamento.aprovado
                    },
                    order: [['createdAt', 'DESC']]
                }),
                db.entities.credenciamento.count({
                    where: {
                        status: statusCredenciamento.aprovado
                    }
                })
            ])
            .then(results => res.send({
                result: true,
                latest: results[0][0] && results[0][0].createdAt,
                count: results[1]
            }))
            .catch(error => res.send({ result: false, error: error }));
        },
        getStatusFornecedores: (req, res) => {
            Promise.all([
                db.entities.participanteFornecedor.findAll({
                    limit: 1,
                    attributes: ['createdAt'],
                    order: [['createdAt', 'DESC']]
                }),
                db.entities.participanteFornecedor.count({})
            ])
            .then(results => res.send({
                result: true,
                latest: results[0][0] && results[0][0].createdAt,
                count: results[1]
            }))
            .catch(error => res.send({ result: false, error: error }));
        },
        healthCheck: (req, res) => {
            res.send({Status: 'Api is running...'});
        },
        getStatusCessoes: (req, res) => {
            Promise.all([
                db.entities.cessao.findAll({
                    limit: 1,
                    attributes: ['createdAt'],
                    order: [['createdAt', 'DESC']]
                }),
                db.entities.cessao.count({})
            ])
            .then(results => res.send({
                result: true,
                latest: results[0][0] && results[0][0].createdAt,
                count: results[1]
            }))
            .catch(error => res.send({ result: false, error: error }));
        },
        getStatusSignins: (req, res) => {
            res.send({ result: false, error: 'Não implementado!' });
        }
    }))
    .init('#health', '$server', (controller, server) => {
        server.get('/health/testPostgresConnection', controller.testPostgresConnection);
        server.get('/health/testOracleConnection', controller.testOracleConnection);
        server.get('/health/testKeyCloakAccess', controller.testKeyCloakAccess);
        server.post('/health/testMailer', controller.testMailer);
        server.get('/health/getStatusCredenciamentos', controller.getStatusCredenciamentos);
        server.get('/health/getStatusFornecedores', controller.getStatusFornecedores);
        server.get('/health/getStatusCessoes', controller.getStatusCessoes);
        server.get('/health/getStatusSignins', controller.getStatusSignins);
        server.get('/health-check', controller.healthCheck);
    });
};
