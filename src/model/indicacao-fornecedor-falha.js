let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@indicacao-fornecedor-falha.entities', () => Promise.resolve({
        identity: 'indicacaoFornecedorFalha',
        attributes: {
            participanteId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            documento: {
                type: Sequelize.STRING(15),
                allowNull: false
            },
            usuario: {
                type: Sequelize.STRING(100),
                allowNull: false
            }, 
        },
        associations: {
            belongsTo: {
                participante: { sourceKey: 'participanteId'},
            }
        }
	}));
};