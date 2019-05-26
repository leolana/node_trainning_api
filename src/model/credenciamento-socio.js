let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@credenciamento-socio.entities', '@@tipos-pessoa', tiposPessoa => {
        let _tiposPessoa = [];

        for (let t in tiposPessoa)
           _tiposPessoa.push(tiposPessoa[t]);

        return Promise.resolve({
			identity: 'credenciamentoSocio',
	        attributes: {
                credenciamentoId: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
				tipoPessoa: {
	                type: Sequelize.SMALLINT,
					allowNull: false,
					isIn: [_tiposPessoa]
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
                email: {
                    type: Sequelize.STRING(200),
                    allowNull: false
                },
                telefone: {
                    type: Sequelize.STRING(10),
                    allowNull: false
                },
                participacao: {
                    type: Sequelize.FLOAT,
                    allowNull: false
                },
                nomeMae: {
                    type: Sequelize.STRING(100)
                },
                rg: {
                    type: Sequelize.STRING(15),
                    allowNull: false
                },
                celular: {
                    type: Sequelize.STRING(11)
                },
                contato: {
                    type: Sequelize.BOOLEAN
                },
                razaoSocial: {
                    type: Sequelize.STRING(100)
                },
                inscricaoEstadual: {
                    type: Sequelize.STRING(50)
                },
                inscricaoMunicipal: {
                    type: Sequelize.STRING(50)
                }
	        },
            validations: {
                verificarDadosPessoa() {
                    if (this.tipoPessoa == tiposPessoa.fisica)
                        if (!this.nomeMae || !this.rg || !this.celular || this.contato == null || typeof(this.contato) === 'undefined')
                            throw 'invalid-sent-data';

                    if (this.tipoPessoa == tiposPessoa.juridica)
                        if (!this.razaoSocial || !this.inscricaoEstadual || !this.inscricaoMunicipal)
                            throw 'invalid-sent-data';
                }
            }
		});
    });
};
