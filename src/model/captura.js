let Sequelize = require('sequelize');

module.exports = di => {
	di.provide('@@tipos-captura', () => Promise.resolve({
		aluguel: 1,
		venda: 2
	}))
		.provide('@captura.entities', '@@tipos-captura', tiposCaptura => {
			let _tipos = [];

			for (let t in tiposCaptura)
				_tipos.push(tiposCaptura[t]);

			return Promise.resolve({
				identity: 'captura',
				attributes: {
					produtoId: {
						type: Sequelize.INTEGER,
						allowNull: false
					},
					inicio: {
						type: Sequelize.DATEONLY,
						allowNull: false
					},
					fim: {
						type: Sequelize.DATEONLY,
						allowNull: true
					},
					tipoCaptura: {
						type: Sequelize.SMALLINT,
						allowNull: false,
						isIn: [_tipos]
					},
					valor: {
						type: Sequelize.FLOAT,
						allowNull: false
					},
					usuario: {
						type: Sequelize.STRING(100),
						allowNull: false
					}
				},
				associations: {
					belongsTo: {
						produto: { sourceKey: 'produtoId' },
					},
				},
			});
		});
};
