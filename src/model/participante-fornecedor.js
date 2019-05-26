let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@participante-fornecedor.entities', () => Promise.resolve({
		identity: 'participanteFornecedor',
        attributes: {
            participanteId: {
                type: Sequelize.INTEGER,
                primaryKey: true
            },
        },
        associations: {
            belongsTo: {
                participante: { sourceKey: 'participanteId' }
            },
            hasMany: {
                participanteVinculo: { as: 'vinculos', foreignKey: 'participanteFornecedorId' },
            },
        }
	}));
};
