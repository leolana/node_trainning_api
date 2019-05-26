let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@migration.entities', () => Promise.resolve({
        identity: '_migration',
        timestamps: false,
        attributes: {
            key: {
                type: Sequelize.STRING(40),
				allowNull: false
            },
            executedAt: {
                type: Sequelize.DATE,
				allowNull: true
            }
        }
    }));
};
