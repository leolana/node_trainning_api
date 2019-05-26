let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@credenciamento.entities', '@@tipos-pessoa', '@@credenciamento-status', '@credenciamento-arquivos.schemas', '$validator', (tiposPessoa, status, schemas, $validator) => {
        let _tiposPessoa = [];

        for (let t in tiposPessoa)
           _tiposPessoa.push(tiposPessoa[t]);

       let _status = [];

       for (let s in status)
           _status.push(status[s]);

        return Promise.resolve({
			identity: 'credenciamento',
	        attributes: {
				tipoPessoa: {
	                type: Sequelize.SMALLINT,
					allowNull: false,
					isIn: [_tiposPessoa]
	            },
				ramoAtividadeCodigo: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                documento: {
                    type: Sequelize.STRING(18),
                    allowNull: false
                },
                nome: {
                    type: Sequelize.STRING(100),
                    allowNull: false
                },
                aberturaNascimento: {
                    type: Sequelize.DATEONLY,
                    allowNull: false
                },
                telefone: {
                    type: Sequelize.STRING(10),
                    allowNull: false
                },
                cep: {
                    type: Sequelize.STRING(8),
                    allowNull: false
                },
                logradouro: {
                    type: Sequelize.STRING(200),
                    allowNull: false
                },
                numero: {
                    type: Sequelize.STRING(15),
                    allowNull: false
                },
                complemento: {
                    type: Sequelize.STRING(50)
                },
                bairro: {
                    type: Sequelize.STRING(100),
                    allowNull: false
                },
                cidadeId: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                nomeMae: {
                    type: Sequelize.STRING(100)
                },
                razaoSocial: {
                    type: Sequelize.STRING(100)
                },
                inscricaoEstadual: {
                    type: Sequelize.STRING(15)
                },
                inscricaoMunicipal: {
                    type: Sequelize.STRING(15)
                },
                faturamentoCartaoId: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                ticketMedioId: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                ecommerce: {
                    type: Sequelize.STRING(255)
                },
                taxaContratualId: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                arquivos: {
                    type: Sequelize.JSONB
                },
                status: {
                    type: Sequelize.SMALLINT,
					allowNull: false,
					isIn: [_status],
                    defaultValue: status.pendente
                },
                ativo: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: true
                },
                usuario: {
                    type: Sequelize.STRING(100),
                    allowNull: false
                },
                participanteId: {
                    type: Sequelize.INTEGER,
                    allowNull: true
                }
	        },
			associations: {
				belongsTo: {
                    cidade: { sourceKey: 'cidadeId' },
                    faturamentoCartao: { sourceKey: 'faturamentoCartaoId' },
                    ramoAtividade: { sourceKey: 'ramoAtividadeCodigo' },
                    taxaContratual: { sourceKey: 'taxaContratualId' },
                    ticketMedio: { sourceKey: 'ticketMedioId' },
                    participante: { sourceKey: 'participanteId' }
				},
                hasMany: {
                    credenciamentoAprovacao: { as: 'historicoAprovacao', foreignKey: 'credenciamentoId' },
                    credenciamentoCaptura: { as: 'capturas', foreignKey: 'credenciamentoId' },
                    credenciamentoDomicilioBancario: { as: 'domiciliosBancarios', foreignKey: 'credenciamentoId' },
                    credenciamentoTaxaAdministrativa: { as: 'taxasAdministrativas', foreignKey: { field: 'credenciamentoId', allowNull: false } },
                    credenciamentoTaxaDebito: { as: 'taxasDebito', foreignKey: { field: 'credenciamentoId', allowNull: false } },
                    credenciamentoSocio: { as: 'socios', foreignKey: 'credenciamentoId' }
                },
                hasOne: {
                    credenciamentoInstalacao: { as: 'instalacao', foreignKey: 'credenciamentoId' },
                    credenciamentoContato: { as: 'contato', foreignKey: 'credenciamentoId' }
                }
			},
            validations: {
                verificarDadosPessoa() {
                    if (this.tipoPessoa == tiposPessoa.fisica && !this.nomeMae)
                        throw 'invalid-sent-data';

                    if (this.tipoPessoa == tiposPessoa.juridica)
                        if (!this.razaoSocial || !this.inscricaoEstadual || !this.inscricaoMunicipal)
                            throw 'invalid-sent-data';
                },
                verificarArquivos() {
                    if (this.tipoPessoa == tiposPessoa.fisica)
                        if (!$validator.check(schemas.pessoaFisica(), this.arquivos))
                            throw 'invalid-sent-data';

                    if (this.tipoPessoa == tiposPessoa.juridica)
                        if (!$validator.check(schemas.pessoaJuridica(), this.arquivos))
                            throw 'invalid-sent-data';
                }
            }
		});
    });
};
