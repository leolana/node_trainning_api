let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@usuario-convite.entities', '@@roles', roles => {
        let _roles = [];

        for (let r in roles)
           _roles.push(roles[r]);

        return Promise.resolve({
            identity: 'usuarioConvite',
            attributes: {
    			codigo: {
    				type: Sequelize.UUID,
    				defaultValue: Sequelize.UUIDV1,
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
                            if (value.some(v => !_roles.includes(v)))
                                throw 'invalid-sent-data';
                        }
                    }
                },
    			convidadoPor: {
    				type: Sequelize.STRING(100),
    				allowNull: false
    			},
    			participante: {
    				type: Sequelize.INTEGER,
    				allowNull: false,
                    defaultValue: 0
    			},
                expiraEm: {
                    type: Sequelize.DATE,
                    allowNull: false
                }
            }
        });
    });
};
