import commercialConditions from './commercialConditions';
import listFees from './listFees';
import findFee from './findFee';
import listFeeTerms from './listFeeTerms';
import listFeeTermRanges from './listFeeTermRanges';
import addFee from './addFee';
import updateFee from './updateFee';
import defaultAnticipationRate from './defaultAnticipationRate';

export default (db) => {
  const usecases = {
    commercialConditions: commercialConditions(db),
    listFees: listFees(db),
    findFee: findFee(db),
    listFeeTerms: listFeeTerms(db),
    listFeeTermRanges: listFeeTermRanges(db),
    addFee: addFee(db),
    updateFee: updateFee(db),
    defaultAnticipationRate: defaultAnticipationRate(db),
  };
  return usecases;
};
