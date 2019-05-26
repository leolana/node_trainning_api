let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@taxa-contratual.entities', '@@tipos-pessoa', tiposPessoa => {
        let _tiposPessoa = [];

        for (let t in tiposPessoa)
           _tiposPessoa.push(tiposPessoa[t]);

        return Promise.resolve({
			identity: 'taxaContratual',
	        attributes: {
				tipoPessoa: {
	                type: Sequelize.SMALLINT,
					isIn: [_tiposPessoa]
	            },
				ramoAtividadeCodigo: {
                    type: Sequelize.INTEGER,
                },
				inicio: {
					type: Sequelize.DATEONLY,
					allowNull: false
				},
				fim: {
					type: Sequelize.DATEONLY,
					allowNull: true
				},
				antecipacao: {
					type: Sequelize.FLOAT,
					allowNull: false
				},
				adesao: {
					type: Sequelize.FLOAT,
					allowNull: false
				},
				maximoParcelas: {
					type: Sequelize.SMALLINT,
					allowNull: false
				},
				usuario: {
					type: Sequelize.STRING(100),
					allowNull: false
				}
	        },
			associations: {
				belongsTo: {
					ramoAtividade: { sourceKey: 'ramoAtividadeCodigo' }
				}
			}
		});
    });
};
