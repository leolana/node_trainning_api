let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@cessao-recebivel-historico.entities',  '@@cessao-recebivel-status', (status) => {
        
        let _status = [];

        for (let s in status)
            _status.push(status[s]);
        
        return Promise.resolve({    
            identity: 'cessaoRecebivelHistorico',
            attributes: {
                cessaoId: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                eventoId: {
                    type: Sequelize.INTEGER,
                    allowNull: true
                },
                dataVenda: {
                    type: Sequelize.DATEONLY,
                    allowNull: true
                },              
                valorVenda : {
                    type: Sequelize.FLOAT,
                    allowNull: true
                }, 
                dataReserva: {
                    type: Sequelize.DATEONLY,
                    allowNull: true
                },
                dataPagarEc: {
                    type: Sequelize.DATEONLY,
                    allowNull: true
                }, 
                valorPagarEc : {
                    type: Sequelize.FLOAT,
                    allowNull: true
                },
                nsu: {
                    type: Sequelize.STRING(30),
                    allowNull: true
                },
                numeroParcela: {
                    type: Sequelize.SMALLINT,
                    allowNull: true
                },
                totalParcelas: {
                    type: Sequelize.SMALLINT,
                    allowNull: true
                },
                statusPagamento: {
                    type: Sequelize.SMALLINT,
                    allowNull: true,
                    isIn: [_status],
                    defaultValue: status.pendentePagamento
                }
            },
        })
    });
};
