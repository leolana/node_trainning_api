let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@taxa-faturamento.entities', () => {

        return Promise.resolve({
			identity: 'taxaFaturamento',
	        attributes: {
				coeficiente: {
                    type: Sequelize.FLOAT,
                    allowNull: false
	            },
				usuario: {
					type: Sequelize.STRING(100),
					allowNull: false
				}
	        },
			associations: {
				belongsTo: {
					faturamentoCartao: { foreignKey: { field: 'faturamentoCartaoId', allowNull: false } },
					taxaBandeira: { foreignKey: { field: 'taxaBandeiraId', allowNull: false } },
                }
			}
		});
    });
};
