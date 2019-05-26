// eslint-disable-next-line max-len
const deformatDocument = require('../../service/credenciamento/deformatDocument.service');
const saveFiles = require('../../service/file/saveFiles.service');
const applyFiles = require('../../service/credenciamento/applyFiles.service');


module.exports = (db, fileStorage) => (
  participantId,
  document,
  name,
  status,
  personType,
  files,
  user
) => {
  document = deformatDocument(document);

  const find = () => db.entities.credenciamentoProposta.findOne({
    where: {
      documento: document,
      participanteId: participantId,
    },
  });

  const save = (credenciamento) => {
    if (credenciamento) throw String('pre-credenciamento-existente');

    return saveFiles('pre-credenciamento', files, document);
  };

  const upload = savedFiles => Promise.all(savedFiles.map(
    file => fileStorage.upload(file.name, file.content)
  ));

  const persistData = (uploadedFiles) => {
    const credenciamento = {
      status,
      tipoPessoa: personType,
      nome: name,
      documento: document,
      arquivos: {
        extratosBancarios: [],
      },
      usuario: user,
      participanteId: participantId,
    };

    applyFiles(uploadedFiles, credenciamento);
    return db.entities.credenciamentoProposta.create(credenciamento);
  };

  return find()
    .then(save)
    .then(upload)
    .then(persistData);
};
