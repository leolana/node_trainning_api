let Sequelize = require('sequelize');

module.exports = (di) => {
	di.provide('@usuario.entities', '@@roles', (roles) => {
		let _roles = Object.values(roles);

		return Promise.resolve({
			identity: 'usuario',
			attributes: {
				id: {
					type: Sequelize.UUID,
					primaryKey: true
				},
				nome: {
					type: Sequelize.STRING(100),
					allowNull: false
				},
				email: {
					type: Sequelize.STRING(100),
					allowNull: false
				},
				celular: {
					type: Sequelize.STRING(11),
					allowNull: false
				},
				roles: {
					type: Sequelize.ARRAY(Sequelize.STRING(50)),
					allowNull: false,
					validate: {
						areKnownRoles: (value) => {
							if (value.some((v) => !_roles.includes(v))) throw 'invalid-sent-data';
						}
					}
				},
				ativo: {
					type: Sequelize.BOOLEAN,
					allowNull: false,
					defaultValue: true
				}
			},
			associations: {
				hasMany: {
					membro: { as: 'associacoes', foreignKey: 'usuarioId' }
				}
			}
		});
	});
};
