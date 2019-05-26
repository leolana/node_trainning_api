let request = require('request-promise-native');

module.exports = di => {
    di.provide('#dominio', '$main-db', '$internal-apis', '$mailer', '@@email-templates', '@mailer-settings', '@@tipos-pessoa', controller)
        .init('#dominio', '$server', (controller, server) => {
            server.get('/dominio/bancos', controller.obterOpcoesBanco);
            server.get('/dominio/bandeiras', controller.obterOpcoesBandeira);
            server.get('/dominio/endereco/:cep', controller.obterEndereco);
            server.get('/dominio/capturas', controller.obterOpcoesCaptura);
            server.get('/dominio/cidades', controller.pesquisarCidades);
            server.get('/dominio/eventos', controller.obterOpcoesEvento);
            server.get('/dominio/faturamento-cartao', controller.obterOpcoesFaturamentoCartao);
            server.get('/dominio/ramos-atividade', controller.pesquisarRamosAtividade);
            server.get('/dominio/ticket-medio', controller.obterOpcoesTicketMedio);
        });
};

function controller(db, internalApis, mailer, emailTemplates, mailerSettings, tiposPessoa) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const vigenciaValida = {
        inicio: { '$lte': today },
        fim: {
            $or: {
                $eq: null,
                $gt: now
            }
        }
    };

    this.obterOpcoesBanco = (req, res) => {
        internalApis.obterBancos()
            .then(bancos => res.send(bancos))
            .catch(error => res.catch(error));
    };

    this.obterOpcoesBandeira = (req, res) => {
        db.entities.bandeira
            .findAll({
                where: { ativo: true },
                attributes: ['id', 'nome']
            })
            .then(bandeiras => bandeiras.map(b => ({
                id: b.id,
                text: b.nome
            })))
            .then(bandeiras => res.send(bandeiras))
            .catch(error => res.catch(error));
    };

    this.obterEndereco = (req, res) => {
        internalApis.obterEndereco(req.params.cep)
            .then(endereco => {
                const where = db.where(
                    db.fn('unaccent', db.col('nome')),
                    { $iLike: db.fn('unaccent', `%${endereco.cidade}%`) }
                );

                return new Promise((resolve, reject) => {
                    if (!endereco.cidade) {
                        endereco.cidadeId = 0;
                        resolve(endereco);
                    }

                    db.entities.cidade
                        .findOne({
                            where: where,
                            attributes: ['id'],
                            order: [['nome', 'ASC']]
                        }).then(cidade => {
                            if (cidade) {
                                endereco.cidadeId = cidade.id;
                            } else {
                                endereco.cidadeId = 0;
                            }

                            resolve(endereco);
                        })
                        .catch(reject);
                });
            })
            .then(endereco => res.send(endereco))
            .catch(error => res.catch(error));
    };

    this.obterOpcoesCaptura = (req, res) => {
        db.entities.captura
            .findAll({
                include: [{
                    model: db.entities.produto,
                    attributes: ['id', 'nome'],
                }],
                where: vigenciaValida,
                attributes: ['id', 'valor', 'tipoCaptura']
            })
            .then(capturas => res.send(capturas))
            .catch(error => res.catch(error));
    };

    this.obterOpcoesEvento = (req, res) => {
        db.entities.evento
            .findAll({
                attributes: ['id', 'nome']
            })
            .then(eventos => res.send(eventos))
            .catch(error => res.catch(error));
    };

    this.obterOpcoesFaturamentoCartao = (req, res) => {
        db.entities.faturamentoCartao
            .findAll({
                where: { ativo: true },
                attributes: ['id', 'descricao']
            })
            .then(opcoes => opcoes.map(o => ({
                id: o.id,
                text: o.descricao
            })))
            .then(opcoes => res.send(opcoes))
            .catch(error => res.catch(error));
    };

    this.obterOpcoesTicketMedio = (req, res) => {
        db.entities.ticketMedio
            .findAll({
                attributes: ['id', 'descricao']
            })
            .then(opcoes => opcoes.map(o => ({
                id: o.id,
                text: o.descricao
            })))
            .then(opcoes => res.send(opcoes))
            .catch(error => res.catch(error));
    };

    this.pesquisarCidades = (req, res) => {
        let where = {};

        if (req.query.term)
            where = db.where(
                db.fn('unaccent', db.col('nome')),
                { $iLike: db.fn('unaccent', `%${req.query.term}%`) }
            );

        if (req.query.id)
            where.id = req.query.id;

        db.entities.cidade
            .findAll({
                where: where,
                attributes: ['id', 'nome', 'estado'],
                order: [['nome', 'ASC']]
            })
            .then(cidades => cidades.map(c => ({
                id: c.id,
                text: `${c.nome} - ${c.estado}`
            })))
            .then(cidades => res.send(cidades))
            .catch(error => res.catch(error));
    };

    this.pesquisarRamosAtividade = (req, res) => {
        const where = { ativo: true };

        if (req.query.tipoPessoa) {
            if (req.query.tipoPessoa == tiposPessoa.fisica) {
                where.restritoPJ = false;
            }
        }

        if (req.query.id) {
            where.codigo = +req.query.id;
        }

        if (req.query.term) {
            where.descricao = db.where(
                db.fn('unaccent', db.col('descricao')),
                { $iLike: db.fn('unaccent', `%${req.query.term}%`) }
            );
        }

        db.entities.ramoAtividade
            .findAll({
                where: where,
                attributes: ['codigo', 'descricao']
            })
            .then(ramos => ramos.map(r => ({
                id: r.codigo,
                text: r.descricao
            })))
            .then(ramos => res.send(ramos))
            .catch(error => res.catch(error));
    };

    this.enviarEmail = (req, res) => {
        mailer
            .enviar({
                templateName: emailTemplates.DEFINIR_SENHA,
                destinatary: req.user.email,
                substitutions: {
                    loginAcesso: 'leonardo.lana',
                    linkRedefinirSenha: `${mailerSettings.baseUrl}/usuario/definirsenha`
                }
            })
            .then(data => res.send(data))
            .catch(error => res.catch(error));
    };

    return Promise.resolve(this);
};
