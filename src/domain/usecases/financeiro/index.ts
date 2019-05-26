import listConsolidatedDataForProvider from './listConsolidatedDataForProvider';
import exportRelatorioDetalhadoUseCase from './exportRelatorioDetalhadoUseCase';

export interface FinanceiroUseCases {
  listConsolidatedDataForProvider?: ReturnType<typeof listConsolidatedDataForProvider>;
  exportRelatorio?: typeof exportRelatorioDetalhadoUseCase;
}

export function getFinanceiroUseCases(db, siscofWrapper) {
  const usecases: FinanceiroUseCases = {};

  usecases.listConsolidatedDataForProvider = listConsolidatedDataForProvider(db, siscofWrapper);
  usecases.exportRelatorio = exportRelatorioDetalhadoUseCase;
  return usecases;
}
