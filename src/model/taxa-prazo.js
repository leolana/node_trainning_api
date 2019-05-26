let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@taxa-prazo.entities', () => {

        return Promise.resolve({
			identity: 'taxaPrazo',
	        attributes: {
                prazo: {
                    type: Sequelize.SMALLINT,
                    allowNull: false,
                },
				coeficiente: {
                    type: Sequelize.FLOAT,
                    allowNull: false
                },
                minimo: {
                    type: Sequelize.SMALLINT,
                    allowNull: false
                },
                maximo: {
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
                    taxa: { foreignKey: { field: 'taxaId', allowNull: false } },
                    evento: { foreignKey: { field: 'eventoId', allowNull: false } },
                },
				hasMany: {
                    taxaAdministrativa: { as: 'taxasAdministrativas', foreignKey: { field: 'taxaPrazoId', allowNull: false } },
				}
			}
		});
    });
};
