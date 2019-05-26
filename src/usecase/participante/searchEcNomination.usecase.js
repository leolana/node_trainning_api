const service = require('../../service/participante/searchNominations.service');

module.exports = db => options => service(db)({
  ...options,
});
