const getProviderNominees = require('./getProviderNominees.usecase');
const updateProviderNominees = require('./updateProviderNominees.usecase');

module.exports = (db) => {
  const usecases = {
    getProviderNominees: getProviderNominees(db),
    updateProviderNominees: updateProviderNominees(db),
  };

  return usecases;
};
