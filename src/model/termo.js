let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@termo.entities',  '@@termo-tipo', (tipo) => {
        let _tipo = [];

        for (let t in tipo)
            _tipo.push(tipo[t]);

        return Promise.resolve({

            identity: 'termo',
            attributes: {
                titulo: {
                    type: Sequelize.STRING(100),
                    allowNull: false
                },
                tipo: {
                    type: Sequelize.SMALLINT,
                    allowNull: false,
                    isIn: [_tipo],
                },
                usuario : {
                    type: Sequelize.STRING(100),
                    allowNull: false
                },
                texto : {
                    type: Sequelize.TEXT,
                    allowNull: false
                },
                inicio: {
                    type: Sequelize.DATEONLY,
                    allowNull: false,
                },
                fim: {
                    type: Sequelize.DATEONLY,
                    allowNull: true,
                }
            },
            associations: {
                hasMany: {
                    participanteAceiteTermo: { as: 'aceites', foreignKey: 'termoId' }
                }    
            }
        })
    })
};
