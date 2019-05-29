import deformatDocument from '../document/deformatDocument';

const fetchFile = (fileStorage) => {
  const findEntity = (model, document, options) => model
    .findOne({
      where: { documento: document, ...(options || {}) },
      attributes: ['arquivos'],
    });

  const findFile = (data, type, index) => {
    if (!data) throw new Error('not-exists');

    const file = type === 'analises'
      ? data.arquivos[type][index]
      : data.arquivos[type];

    if (!file) throw new Error('file-not-exists');

    return file.arquivo ? file.arquivo : file;
  };

  return (
    type,
    index,
    document,
    model,
    options = null
  ) => Promise.resolve(deformatDocument(document))
    .then(vDocument => findEntity(model, vDocument, options))
    .then(data => findFile(data, type, index))
    .then(filename => fileStorage.download(`${filename}`)
      .then(data => ({
        ...data,
        filename,
      })));
};

export default fetchFile;
