const applyFiles = (uploadedFiles, credenciamento) => {
  uploadedFiles.forEach((item) => {
    const file = item.key;

    if (item.key.indexOf('identidade') >= 0) {
      credenciamento.arquivos.identidade = file;
    }

    if (item.key.indexOf('fichaCadastro') >= 0) {
      credenciamento.arquivos.fichaCadastro = file;
    }

    if (item.key.indexOf('comprovanteDeResidencia') >= 0) {
      credenciamento.arquivos.comprovanteDeResidencia = file;
    }

    if (item.key.indexOf('contratoSocial') >= 0) {
      credenciamento.arquivos.contratoSocial = file;
    }
  });
};

export default applyFiles;
