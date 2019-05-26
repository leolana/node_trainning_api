const commercialConditions = require('./commercialConditions.usecase');
const listFees = require('./listFees.usecase');
const findFee = require('./findFee.usecase');
const listFeeTerms = require('./listFeeTerms.usecase');
const listFeeTermRanges = require('./listFeeTermRanges.usecase');
const addFee = require('./addFee.usecase');
const updateFee = require('./updateFee.usecase');

module.exports = db => {
  const usecases = {
    commercialConditions: commercialConditions(db),
    listFees: listFees(db),
    findFee: findFee(db),
    listFeeTerms: listFeeTerms(db),
    listFeeTermRanges: listFeeTermRanges(db),
    addFee: addFee(db),
    updateFee: updateFee(db),
  };
  return usecases;
};
