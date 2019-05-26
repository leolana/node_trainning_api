const fetchFile = require('../file/fetchFile.util');

module.exports = (db, fileStorage) => (
  type,
  index,
  document
) => {
  const fetch = fetchFile(fileStorage);

  const options = { ativo: true };

  return fetch(type, index, document, db.entities.credenciamento, options);
};
