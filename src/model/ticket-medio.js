let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@ticket-medio.entities', () => Promise.resolve({
        identity: 'ticketMedio',
        attributes: {
            descricao: {
                type: Sequelize.STRING(200),
				allowNull: false
            }
        }
    }));
};
