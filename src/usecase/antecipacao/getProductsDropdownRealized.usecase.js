const events = require('../../service/eventos/anticipationRealized.enum');

module.exports = db => ()=> {
 return db.entities.evento.findAll({ where: { id: Object.values(events) } });
};
