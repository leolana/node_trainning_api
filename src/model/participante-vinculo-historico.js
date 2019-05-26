let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@participante-vinculo-historico.entities',  '@@participante-vinculo-status', (status) => {
        
        let _status = [];

        for (let s in status)
            _status.push(status[s]);
        
        return Promise.resolve({    
            identity: 'participanteVinculoHistorico',
            attributes: {
                participanteEstabelecimentoId: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                participanteFornecedorId: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                usuario: {
                    type: Sequelize.STRING(100),
                    allowNull: true
                },
                status: {
                    type: Sequelize.SMALLINT,
					allowNull: false,
					isIn: [_status],
                    defaultValue: status.pendente
                },
                exibeValorDisponivel:{
                    type: Sequelize.BOOLEAN,
                    allowNull: false
                },
                diasAprovacao: {
                    type: Sequelize.SMALLINT,
                    allowNull: false,
                },
                dataRespostaEstabelecimento:{
                    type: Sequelize.DATE,
                    allowNull: true
                },
                usuarioRespostaEstabelecimento: {
                    type: Sequelize.STRING(100),
                    allowNull: true
                },
                valorMaximoExibicao: {
                    type: Sequelize.FLOAT,
                    allowNull: true,
                },
            }
        })
	});
};
