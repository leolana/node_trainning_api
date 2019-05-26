let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@credenciamento-aprovacao.entities', '@@credenciamento-status', status => {
        let _status = [];

        for (let s in status)
            _status.push(status[s]);

        return Promise.resolve({
    		identity: 'credenciamentoAprovacao',
            attributes: {
                credenciamentoId: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                status: {
                    type: Sequelize.SMALLINT,
					allowNull: false,
					isIn: [_status]
                },
                usuario: {
                    type: Sequelize.STRING(100),
                    allowNull: false
                },
                observacao: {
                    type: Sequelize.STRING(1000),
                    allowNull: false
                }
            }
        });
    });
}
