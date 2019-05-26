let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@antecipacao-recebivel.entities',  '@@antecipacao-recebivel-status', (status) => {

        let _status = [];

        for (let s in status)
            _status.push(status[s]);

        return Promise.resolve({
            identity: 'antecipacaoRecebivel',
            attributes: {
                antecipacaoId: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                dataPagamento: {
                    type: Sequelize.DATEONLY,
                    allowNull: true
                },
                diasAntecipacao: {
                    type: Sequelize.SMALLINT,
                    allowNull: false
                },
                valorPagar : {
                    type: Sequelize.FLOAT,
                    allowNull: false
                },
                taxaAntecipacao: {
                    type: Sequelize.FLOAT,
                    allowNull: false
                },
                descontoAntecipacao: {
                    type: Sequelize.FLOAT,
                    allowNull: false
                },
                valorAntecipado : {
                    type: Sequelize.FLOAT,
                    allowNull: false
                },
                rowId: {
                    type: Sequelize.STRING(30),
                    allowNull: false
                },
                bandeiraId: {
                    type: Sequelize.INTEGER,
                    allowNull: true
                },
                eventoId: {
                    type: Sequelize.INTEGER,
                    allowNull: true
                }
            },
            associations: {
                belongsTo: {
                    evento: { sourceKey: 'eventoId' },
                    bandeira: {sourceKey: 'bandeiraId'}
                }
            }
        })
    });
};
