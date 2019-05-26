let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@produto.entities', () => Promise.resolve({
        identity: 'produto',
        attributes: {
            nome: {
                type: Sequelize.STRING(100),
				allowNull: false
            },
			descricao: {
                type: Sequelize.STRING(250)
            },
			usuario: {
				type: Sequelize.STRING(100),
				allowNull: false
			},
			ativo: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            }
        },
        associations: {
            hasMany: {
                captura: { as: 'capturas', foreignKey: 'produtoId' },
            },
        },
    }));
};
