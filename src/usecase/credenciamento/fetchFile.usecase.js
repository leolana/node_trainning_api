// eslint-disable-next-line max-len
const fetchAccreditationFile = require('../../service/credenciamento/fetchAccreditationFile.service');
// eslint-disable-next-line max-len
const fetchSuggestionFile = require('../../service/credenciamento/fetchSuggestionFile.service');

module.exports = (db, fileStorage) => {
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
