let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@taxa.entities', '@@tipos-pessoa', tiposPessoa => {
        let _tiposPessoa = [];

        for (let t in tiposPessoa)
           _tiposPessoa.push(tiposPessoa[t]);

        return Promise.resolve({
			identity: 'taxa',
	        attributes: {
				tipoPessoa: {
	                type: Sequelize.SMALLINT,
					isIn: [_tiposPessoa]
	            },
				inicio: {
					type: Sequelize.DATEONLY,
					allowNull: false
				},
				fim: {
					type: Sequelize.DATEONLY,
					allowNull: true
				},
                default: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: false
                },
				usuario: {
					type: Sequelize.STRING(100),
					allowNull: false
				}
	        },
			associations: {
				belongsTo: {
                    ramoAtividade: { sourceKey: 'ramoAtividadeCodigo' }
				},
				hasMany: {
					taxaBandeira: { as: 'bandeiras', foreignKey: 'taxaId' },
					taxaPrazo: { as: 'prazos', foreignKey: 'taxaId' }
				}
			}
		});
    });
};
