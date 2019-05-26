let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@participante-aceite-termo.entities', () => Promise.resolve({
        identity: 'participanteAceiteTermo',
        attributes: {
            participanteId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            termoId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
			usuario: {
				type: Sequelize.STRING(100),
				allowNull: false
			},
        },
        associations: {
            belongsTo: {
                participante: { sourceKey: 'participanteId' },
                termo: { sourceKey: 'termoId' },
            },
        }
    }));
};
