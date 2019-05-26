let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@faturamento-cartao.entities', () => Promise.resolve({
        identity: 'faturamentoCartao',
        attributes: {
            descricao: {
                type: Sequelize.STRING(200),
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
