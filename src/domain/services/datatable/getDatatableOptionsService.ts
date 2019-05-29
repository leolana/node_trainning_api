export const getDatatableOptionsService = (query) => {
  const datatablePaginator: DatatableInterface = {
    pageSize: +query.pageSize,
    pageIndex: +query.pageIndex,
    sortColumn: query.sortColumn,
    sortOrder: query.sortOrder
  };

  return (datatablePaginator);
};

export interface DatatableInterface {
  pageSize: number;
  pageIndex: number;
  sortColumn: string;
  sortOrder: 'asc' | 'desc';
}

export default getDatatableOptionsService;
