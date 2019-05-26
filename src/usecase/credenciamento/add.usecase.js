const mutateService = require('../../service/credenciamento/mutate.service');
// eslint-disable-next-line max-len
const deformatDocument = require('../../service/credenciamento/deformatDocument.service');

module.exports = (db, fileStorage) => (
  data,
  files,
  documento,
  user
) => {
  documento = deformatDocument(documento);

  const mutate = mutateService(db, fileStorage);

  return mutate(data, files, documento, user);
};
