const service = require('../../service/motivoRecusa/list.service');
const types = require('../../service/motivoRecusa/recusa-tipo.enum');

module.exports = db => () => service(db)(types.recusa_vinculo);
