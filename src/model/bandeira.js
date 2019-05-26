let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@bandeira.entities', () => Promise.resolve({
        identity: 'bandeira',
        attributes: {
            nome: {
                type: Sequelize.STRING(100),
				allowNull: false
            },
            ativo: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
        }
    }));
};
