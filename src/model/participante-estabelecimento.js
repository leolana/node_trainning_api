let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@participante-estabelecimento.entities', () => Promise.resolve({
		identity: 'participanteEstabelecimento',
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
                participanteVinculo: { as: 'vinculos', foreignKey: 'participanteEstabelecimentoId' },
             },
        }
	}));
};

