import fetchFile from '../file/fetchFile';

const participanteFetchFile = (db, fileStorage) => (
  type,
  index,
  document,
  id
) => {
  const fetch = fetchFile(fileStorage);

  const options = { id };

  return fetch(type, index, document, (db.models as any).participante, options);
};

export default participanteFetchFile;
