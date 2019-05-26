let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@credenciamento-domicilio-bancario.entities', () => Promise.resolve({
		identity: 'credenciamentoDomicilioBancario',
        attributes: {
            credenciamentoId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            bandeiraId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            bancoId: {
                type: Sequelize.STRING(3),
                allowNull: false
            },
            bancoNome: {
                type: Sequelize.STRING(50),
                allowNull: false
            },
            agencia: {
                type: Sequelize.STRING(5),
                allowNull: false
            },
            conta: {
                type: Sequelize.STRING(10),
                allowNull: false
            },
            digito: {
                type: Sequelize.STRING(1),
                allowNull: false
            }
        },
        associations: {
            belongsTo: {
                bandeira: { sourceKey: 'bandeiraId' }
            }
        }
	}));
};
