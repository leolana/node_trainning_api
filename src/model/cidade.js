let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@@estados', () => Promise.resolve({
		AC: 'Acre',
		AL: 'Alagoas',
		AP: 'Amapá',
		AM: 'Amazonas',
		BA: 'Bahia',
		CE: 'Ceará',
		DF: 'Distrito Federal',
		ES: 'Espírito Santo',
		GO: 'Goiás',
		MA: 'Maranhão',
		MT: 'Mato Grosso',
		MS: 'Mato Grosso do Sul',
		MG: 'Minas Gerais',
		PA: 'Pará',
		PB: 'Paraíba',
		PR: 'Paraná',
		PE: 'Pernambuco',
		PI: 'Piauí',
		RJ: 'Rio de Janeiro',
		RN: 'Rio Grande do Norte',
		RS: 'Rio Grande do Sul',
		RO: 'Rondônia',
		RR: 'Roraima',
		SC: 'Santa Catarina',
		SP: 'São Paulo',
		SE: 'Sergipe',
		TO: 'Tocantins'
	}))
	.provide('@cidade.entities', '@@estados', estados => {
        let _estados = [];

        for (let e in estados)
           _estados.push(e);

        return Promise.resolve({
			identity: 'cidade',
	        attributes: {
	            nome: {
	                type: Sequelize.STRING(100),
					allowNull: false
	            },
				estado: {
	                type: Sequelize.STRING(2),
					allowNull: false,
					isIn: [_estados]
	            }
	        }
		});
    });
};
