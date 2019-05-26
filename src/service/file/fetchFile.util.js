const deformatDocument = require('../credenciamento/deformatDocument.service');

module.exports = (fileStorage) => {
  const findEntity = (model, document, options) => model
    .findOne({
      where: { documento: document, ...(options || {}) },
      attributes: ['arquivos'],
    });

  const findFile = (data, type, index) => {
    if (!data) throw String('not-exists');

    const file = type === 'extratosBancarios' || type === 'analises'
      ? data.arquivos[type][index]
      : data.arquivos[type];

    if (!file) throw String('file-not-exists');

    return file.arquivo ? file.arquivo : file;
  };

  return (
    type,
    index,
    document,
    model,
    options
  ) => Promise.resolve(deformatDocument(document))
    .then(vDocument => findEntity(model, vDocument, options))
    .then(data => findFile(data, type, index))
    .then(filename => fileStorage.download(`${filename}`)
      .then(data => ({
        ...data,
        filename,
      })));
};
