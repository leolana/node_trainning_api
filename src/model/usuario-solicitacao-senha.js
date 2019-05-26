let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@usuario-solicitacao-senha.entities', () => {
        return Promise.resolve({
            identity: 'usuarioSolicitacaoSenha',
            attributes: {
    			codigo: {
    				type: Sequelize.UUID,
    				defaultValue: Sequelize.UUIDV1,
    				primaryKey: true
    			},
                email: {
                    type: Sequelize.STRING(100),
    				allowNull: false
                },
                expiraEm: {
                    type: Sequelize.DATE,
                    allowNull: false
                }
            }
        });
    });
};
