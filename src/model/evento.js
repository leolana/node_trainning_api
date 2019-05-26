let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@evento.entities', () => Promise.resolve({
        identity: 'evento',
        attributes: {
            nome: {
                type: Sequelize.STRING(100),
				allowNull: false
            },
        }
    }));
};
