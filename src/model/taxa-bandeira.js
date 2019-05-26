let Sequelize = require('sequelize');

module.exports = di => {
	di.provide('@taxa-bandeira.entities', () => {

		return Promise.resolve({
			identity: 'taxaBandeira',
			attributes: {
				taxaDebito: {
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
					taxa: { foreignKey: { field: 'taxaId', allowNull: false } },
					bandeira: { foreignKey: { field: 'bandeiraId', allowNull: false } },
				},
				hasMany: {
					taxaFaturamento: { as: 'faturamentos', foreignKey: { field: 'taxaBandeiraId', allowNull: false } }
				}
			}
		});
	});
};
