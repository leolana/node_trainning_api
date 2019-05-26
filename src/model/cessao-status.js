const status = require('../service/cessao/status.enum');

module.exports = di => di
  .provide('@@cessao-status', () => Promise.resolve(status));
