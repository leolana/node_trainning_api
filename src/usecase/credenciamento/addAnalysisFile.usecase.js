const saveFiles = require('../../service/file/saveFiles.service');

module.exports = (db, fileStorage) => (id, files, data, user) => {
  let credenciamento = null;

  const find = () => db.entities.credenciamento
    .findOne({
      where: { id },
      attributes: ['documento', 'arquivos'],
    });

  const save = (result) => {
    if (!result) throw String('credenciamento-nao-localizado');

    credenciamento = result;

    return saveFiles(
      'credenciamento/analise',
      files,
      credenciamento.documento
    );
  };

  const upload = savedFiles => Promise.all(savedFiles.map(
    file => fileStorage.upload(file.name, file.content)
  ));

  const persistData = (uploadedFiles) => {
    uploadedFiles.forEach((item) => {
      const file = item.key;

      if (data.id) {
        const analiseIndex = credenciamento.arquivos.analises.findIndex(
          a => a.id === data.id
        );
        credenciamento.arquivos.analises[analiseIndex].arquivo = file;
      } else {
        credenciamento.arquivos.analises.push({
          id: credenciamento.arquivos.analises.length + 1,
          arquivo: file,
          observacao: data.observacao,
          usuario: user,
          createdAt: new Date().toDateString(),
          updatedAt: new Date().toDateString(),
        });
      }
    });

    if (data.id) {
      /* eslint-disable max-len */
      const analiseIndex = credenciamento.arquivos.analises.findIndex(a => a.id === data.id);
      credenciamento.arquivos.analises[analiseIndex].observacao = data.observacao;
      credenciamento.arquivos.analises[analiseIndex].updatedAt = new Date().toDateString();
      /* eslint-enable max-len */
    }

    return db.entities.credenciamento.update(
      { arquivos: credenciamento.arquivos },
      { where: { id } },
    )
      .then(() => credenciamento.arquivos.analises);
  };

  return find()
    .then(save)
    .then(upload)
    .then(persistData);
};
