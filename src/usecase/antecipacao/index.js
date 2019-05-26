const getHourLimit = require('./getHourLimit.usecase');
const getMonthsDropdown = require('./getMonthsDropdown.usecase');
const getProductsDropdown = require('./getProductsDropdown.usecase');
const getProductsRealized = require('./getProductsDropdownRealized.usecase');
const listRealized = require('./listRealized.usecase');
const listReceivables = require('./listReceivables.usecase');
const requestAnticipation = require('./requestAnticipation.usecase');

module.exports = (db, siscofWrapper) => {
  const usecases = {
    getHourLimit,
    getMonthsDropdown,
    getProductsDropdown: getProductsDropdown(db),
    getProductsDropdownRealized: getProductsRealized(db),
    listRealized: listRealized(db, siscofWrapper),
    listReceivables: listReceivables(db, siscofWrapper),
    requestAnticipation: requestAnticipation(db, siscofWrapper),
  };

  return usecases;
};
