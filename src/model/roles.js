const roles = require('../service/auth/roles.enum');

module.exports = (di) => {
  di.provide('@@roles', () => Promise.resolve(roles));
};
