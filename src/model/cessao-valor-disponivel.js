let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@cessao-valor-disponivel.entities', () => Promise.resolve({
		identity: 'cessaoValorDisponivel',
        attributes: {
            dataConsulta: {
                type: Sequelize.DATEONLY,
                allowNull: true
            },              
            valorDisponivel : {
                type: Sequelize.FLOAT,
                allowNull: true
            }, 
            usuario: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
        },
        associations: {
            belongsTo: {
                participanteVinculo: { sourceKey: 'participanteVinculoId', foreignKey: { allowNull: false }},
            }
        }
	}));
};
