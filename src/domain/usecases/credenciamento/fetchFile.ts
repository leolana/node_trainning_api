import fetchAccreditationFile from '../../services/credenciamento/fetchAccreditationFile';
import fetchSuggestionFile from '../../services/credenciamento/fetchSuggestionFile';

const fetchFile = (db, fileStorage) => {
  const fetchAccr = fetchAccreditationFile(db, fileStorage);
  const fetchSugg = fetchSuggestionFile(db, fileStorage);

  return {
    accreditation: (
      type, index, document
    ) => fetchAccr(type, index, document),
    suggestion: (
      type, index, document
    ) => fetchSugg(type, index, document),
  };
};

export default fetchFile;
