let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@credenciamento-taxa-administrativa.entities', () => Promise.resolve({
		identity: 'credenciamentoTaxaAdministrativa',
        attributes: {
            valor: {
                type: Sequelize.FLOAT,
                allowNull: false
            }
        },
        associations: {
            belongsTo: {
                taxaAdministrativa: { foreignKey: { field: 'taxaAdministrativaId', allowNull: false }  }
            }
        }
	}));
};
