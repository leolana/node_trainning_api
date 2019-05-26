let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@ramo-atividade.entities', () => Promise.resolve({
        identity: 'ramoAtividade',
        attributes: {
            codigo: {
                type: Sequelize.INTEGER,
                primaryKey: true
            },
            descricao: {
                type: Sequelize.STRING(100)
            },
            restritoPJ: {
                type: Sequelize.BOOLEAN,
                allowNull: false
            },
            ativo: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            }
        }
    }));
};
