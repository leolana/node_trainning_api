let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@cessao-historico.entities',  '@@cessao-recebivel-status', (status) => {
        
        let _status = [];

        for (let s in status)
            _status.push(status[s]);
        
        return Promise.resolve({    
            identity: 'cessaoHistorico',
            attributes: {
                cessaoId: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                participanteVinculoId: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                solicitante: {
                    type: Sequelize.STRING(100),
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
                valorSolicitado: {
                    type: Sequelize.FLOAT,
                    allowNull: false,
                },
                valorDisponivel: {
                    type: Sequelize.FLOAT,
                    allowNull: false,
                },
                dataVencimento : {
                    type : Sequelize.DATEONLY,
                    allowNull : false,
                },
                dataExpiracao : {
                    type : Sequelize.DATEONLY,
                    allowNull: false,
                },
                codigoCessao : {
                    type: Sequelize.INTEGER,
                    allowNull : true
                },
                referencia : {
                    type: Sequelize.STRING (30),
                    allowNull: true
                },
                codigoRetornoSiscof : {
                    type: Sequelize.INTEGER,
                    allowNull: true
                },
                mensagemRetornoSiscof : {
                    type: Sequelize.STRING (500),
                    allowNull: true
                },
                taxaCessao: {
                    type: Sequelize.FLOAT,
                    allowNull: true,
                },
                fornecedorAceiteTermoId: {
                    type: Sequelize.INTEGER,
                    allowNull: true // temporario
                },
                estabelecimentoAceiteTermoId: {
                    type: Sequelize.INTEGER,
                    allowNull: true // temporario
                },
                dataRespostaEstabelecimento:{
                    type: Sequelize.DATE,
                    allowNull: true
                },
                usuarioRespostaEstabelecimento: {
                    type: Sequelize.STRING(100),
                    allowNull: true
                },
                numeroParcelas: {
                    type: Sequelize.SMALLINT,
                    allowNull: true
                },
            },
            associations: {
                belongsTo: {
                    cessao: { sourceKey: 'cessaoId' }
                }
            }
        })
    });
};
