let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@credenciamento-taxa-debito.entities', () => Promise.resolve({
		identity: 'credenciamentoTaxaDebito',
        attributes: {
            valor: {
                type: Sequelize.FLOAT,
                allowNull: false
            }
        },
        associations: {
            belongsTo: {
                taxaBandeira: { foreignKey: { field: 'taxaBandeiraId', allowNull: false } },
            }
        }
	}));
};
