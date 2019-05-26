let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@credenciamento-captura.entities', () => Promise.resolve({
		identity: 'credenciamentoCaptura',
        attributes: {
            credenciamentoId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            capturaId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            quantidade: {
                type: Sequelize.SMALLINT,
                allowNull: false
            }
        },
        associations: {
            belongsTo: {
                captura: { sourceKey: 'capturaId' }
            }
        }
	}));
};
