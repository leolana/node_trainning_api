let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@participante-existente-siscof.entities', () => Promise.resolve({
		identity: 'participanteExistenteSiscof',
        attributes: {
            participanteId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            documento: {
                type: Sequelize.STRING(15),
                allowNull: true,
            },
        },
	}));
};
