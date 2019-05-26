const service = require('../../service/participante/rejectNomination.service');

// eslint-disable-next-line max-len
module.exports = db => (id, reasonId, reason, user) => service(db)(id, reasonId, reason, user);
