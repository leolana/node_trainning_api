const fetchFile = require('../file/fetchFile.util');

module.exports = (db, fileStorage) => (
  type,
  index,
  document
) => {
  const fetch = fetchFile(fileStorage);

  return fetch(type, index, document, db.entities.credenciamentoProposta);
};
