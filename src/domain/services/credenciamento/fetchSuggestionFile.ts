import fetchFile from '../file/fetchFile';

const fetchSuggestionFile = (db, fileStorage) => (
  type,
  index,
  document
) => {
  const fetch = fetchFile(fileStorage);

  return fetch(type, index, document, db.entities.credenciamentoProposta);
};

export default fetchSuggestionFile;
