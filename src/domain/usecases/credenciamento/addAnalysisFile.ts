import mapFiles from '../../services/file/mapFiles';

const addAnalysisFile = (db, fileStorage) => (id, files, data, user) => {
  let credenciamento = null;

  const find = () => {
    const promise = db.entities.credenciamento.findOne({
      where: { id },
      attributes: ['documento', 'arquivos'],
    });

    return promise.then((result) => {
      if (!result) {
        throw String('credenciamento-nao-localizado');
      }
      credenciamento = result;
    });
  };

  const map = () => mapFiles(
    files,
    credenciamento.documento,
    'credenciamento/analise'
  );

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
      const analiseIndex = credenciamento.arquivos.analises.findIndex(a => a.id === data.id);
      credenciamento.arquivos.analises[analiseIndex].observacao = data.observacao;
      credenciamento.arquivos.analises[analiseIndex].updatedAt = new Date().toDateString();
    }

    return db.entities.credenciamento.update(
      { arquivos: credenciamento.arquivos },
      { where: { id } },
    )
      .then(() => credenciamento.arquivos.analises);
  };

  return find()
    .then(map)
    .then(upload)
    .then(persistData);
};

export default addAnalysisFile;
