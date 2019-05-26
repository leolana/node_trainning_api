import getHourLimit from './getHourLimit';
import getMonthsDropdown from './getMonthsDropdown';
import getProductsDropdown from './getProductsDropdown';
import getProductsDropdownRealized from './getProductsDropdownRealized';
import listRealized from './listRealized';
import listReceivables from './listReceivables';
import requestAnticipation from './requestAnticipation';

export default (db, siscofWrapper) => {
  const usecases = {
    getHourLimit,
    getMonthsDropdown,
    getProductsDropdown: getProductsDropdown(db),
    getProductsDropdownRealized: getProductsDropdownRealized(db),
    listRealized: listRealized(db, siscofWrapper),
    listReceivables: listReceivables(db, siscofWrapper),
    requestAnticipation: requestAnticipation(db, siscofWrapper),
  };

  return usecases;
};
