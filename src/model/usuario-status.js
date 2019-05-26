const userStatus = require('../usecase/usuario/status.enum');

module.exports = (di) => {
  di.provide('@@usuario-status', () => Promise.resolve(userStatus));
};
