import fetchFile from '../file/fetchFile';

const fetchAccreditationFile = (db, fileStorage) => (
  type,
  index,
  document
) => {
  const fetch = fetchFile(fileStorage);

  const options = { ativo: true };

  return fetch(type, index, document, db.entities.credenciamento, options);
};

export default fetchAccreditationFile;
