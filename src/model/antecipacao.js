let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@antecipacao.entities',  '@@antecipacao-status', (status) => {

        let _status = [];

        for (let s in status)
            _status.push(status[s]);

        return Promise.resolve({
            identity: 'antecipacao',
            attributes: {
                participanteId: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                usuario: {
                    type: Sequelize.STRING(100),
                    allowNull: false
                },
                dataPagamento : {
                    type : Sequelize.DATEONLY,
                    allowNull : false
                },
                status: {
                    type: Sequelize.SMALLINT,
					allowNull: false,
					isIn: [_status],
                    defaultValue: status.solicitado
                },
            },
            associations: {
                hasMany: {
                    antecipacaoRecebivel: { as: 'recebiveisAntecipacao', foreignKey: 'antecipacaoId' },
                 },
            }
        })
	});
};
