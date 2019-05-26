import { DatatableInterface } from './getDatatableOptionsService';

export const setDatatableOptionsService = (datatableOptions: DatatableInterface, config) => {
  config.limit = datatableOptions.pageSize;
  config.offset = datatableOptions.pageSize * datatableOptions.pageIndex;
  config.subQuery = false;
  if (datatableOptions.sortColumn !== 'null') {
    config.order = [[datatableOptions.sortColumn, datatableOptions.sortOrder]];
  }
};
