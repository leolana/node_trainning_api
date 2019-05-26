let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@membro.entities', () => {
        return Promise.resolve({
            identity: 'membro',
            attributes: {
                participanteId: {
    				type: Sequelize.INTEGER,
    				primaryKey: true
    			},
    			usuarioId: {
                    type: Sequelize.UUID,
    				primaryKey: true
    			}
            },
            associations: {
                belongsTo: {
                    participante: { sourceKey: 'participanteId' },
                    usuario: { sourceKey: 'usuarioId' }
                }
            }
        });
    });
};
