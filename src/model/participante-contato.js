let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@participante-contato.entities', () => Promise.resolve({
		identity: 'participanteContato',
        attributes: {
            participanteId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            nome: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            email: {
                type: Sequelize.STRING(200),
                allowNull: false
            },
            telefone: {
                type: Sequelize.STRING(10),
                allowNull: true
            },
            celular: {
                type: Sequelize.STRING(11),
                allowNull: false
            },
            ativo: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
        }, 
        associations: {
            belongsTo: {
               
            }
        },
	}));
};
