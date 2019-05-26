let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@participante-vinculo-recorrente.entities',  '@@participante-vinculo-status', (status) => {
        let _status = [];

        for (let s in status)
            _status.push(status[s]);

        return Promise.resolve({
            identity: 'participanteVinculoRecorrente',
            attributes: {
                participanteVinculoId: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                usuario: {
                    type: Sequelize.STRING(100),
                    allowNull: false
                },
                status: {
                    type: Sequelize.SMALLINT,
					allowNull: false,
					isIn: [_status],
                    defaultValue: status.pendente
                },
                valorMaximo: {
                    type: Sequelize.FLOAT,
                    allowNull: false,
                },
                dataFinalVigencia:{
                    type: Sequelize.DATEONLY,
                    allowNull: false
                },
                usuarioAprovadorEstabelecimento: {
                    type: Sequelize.STRING(100),
                    allowNull: true
                },
                dataAprovacaoEstabelecimento:{
                    type: Sequelize.DATE,
                    allowNull: true
                },
            },
        })
	});
};
