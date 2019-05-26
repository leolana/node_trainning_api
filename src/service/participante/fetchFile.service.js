const fetchFile = require('../file/fetchFile.util');

module.exports = (db, fileStorage) => (
  type,
  index,
  document,
  id
) => {
  const fetch = fetchFile(fileStorage);

  const options = { id };

  return fetch(type, index, document, db.entities.participante, options);
};
