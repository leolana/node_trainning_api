const recusaTipo = require('../service/motivoRecusa/recusa-tipo.enum');

module.exports = di => di
  .provide('@@recusa-tipo', () => Promise.resolve(recusaTipo));
