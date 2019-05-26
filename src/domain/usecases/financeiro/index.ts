import listConsolidatedDataForProvider from './listConsolidatedDataForProvider';
import exportRelatorioUseCase from './exportRelatorioUseCase';

export interface FinanceiroUseCases {
  listConsolidatedDataForProvider?: ReturnType<typeof listConsolidatedDataForProvider>;
  exportRelatorio?: ReturnType<typeof exportRelatorioUseCase>;
}

export function getFinanceiroUseCases(db, siscofWrapper) {
  const usecases: FinanceiroUseCases = {};

  usecases.listConsolidatedDataForProvider = listConsolidatedDataForProvider(db, siscofWrapper);
  usecases.exportRelatorio = exportRelatorioUseCase();
  return usecases;
}
