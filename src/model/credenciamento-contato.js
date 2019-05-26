let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@credenciamento-contato.entities', () => Promise.resolve({
		identity: 'credenciamentoContato',
        attributes: {
            credenciamentoId: {
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
            }
        }, 
	}));
};
