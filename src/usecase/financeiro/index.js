const listConsolidated = require('./listConsolidatedDataForProvider.usecase');

module.exports = (db, siscofWrapper) => {
  const usecases = {
    listConsolidatedDataForProvider: listConsolidated(db, siscofWrapper),
  };

  return usecases;
};
