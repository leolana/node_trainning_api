let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@taxa-administrativa.entities', () => {

        return Promise.resolve({
			identity: 'taxaAdministrativa',
	        attributes: {
				valorBase: {
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
					bandeira: { foreignKey: { field: 'bandeiraId', allowNull: false } },
					taxaPrazo: { foreignKey: { field: 'taxaPrazoId', allowNull: false } },
				}
			}
		});
    });
};
