let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@cessao-aceite.entities',  '@@cessao-status', (status) => {
        
        let _status = [];

        for (let s in status)
            _status.push(status[s]);
        
        return Promise.resolve({    
            identity: 'cessaoAceite',
            attributes: {
                cessaoId: {
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
                termoId : {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                mensagemSiscof : {
                    type: Sequelize.STRING (500),
                    allowNull: true
                },
                codRetornoSiscof : {
                    type: Sequelize.INTEGER,
                    allowNull: true
                },
            },
            associations: {
                belongsTo: {
                    termo: { sourceKey: 'termoId' }
                },
            }
        })
	});
};
