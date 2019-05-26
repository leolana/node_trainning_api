import searchEcNominationUseCase from './searchEcNominationUseCase';
import getProviderNomineesUseCase from './getProviderNomineesUseCase';
import updateProviderNomineesUseCase from './updateProviderNomineesUseCase';
import fetchReportFile from './fetchReportFile';

export default (db, fileStorage) => {
  const usecases = {
    searchEcNomination: searchEcNominationUseCase(db),
    getProviderNominees: getProviderNomineesUseCase(db),
    updateProviderNominees: updateProviderNomineesUseCase(db),
    fetchReportFile: fetchReportFile(db, fileStorage)
  };

  return usecases;
};
