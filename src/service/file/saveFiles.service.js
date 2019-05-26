const fs = require('fs');
const { DateTime } = require('luxon');
const deformatDocument = require('../credenciamento/deformatDocument.service');

module.exports = (processo, files, documento) => {
  const uploadFilesPromises = [];
  const folder = deformatDocument(documento);
  // Necessário manter esse formato pois essa data será usada como URL
  // Não pode alterar, senão não conseguiremos buscar os arquivos existentes
  const timespan = DateTime.local().toUTC().toString().replace(/[\\:/.]/g, '-');
  Object.keys(files).forEach((key) => {
    const promise = new Promise((resolve, reject) => {
      let fileType;

      if (key.indexOf('extratoBancario') >= 0) fileType = 'extratosBancarios';
      else if (key.indexOf('analise') >= 0) fileType = 'analises';
      else fileType = key;

      const file = files[key];
      const name = `${processo}/${folder}/${fileType}/${timespan}/${file.name}`;

      fs.readFile(file.path, (err, data) => {
        if (err) reject(err);
        else resolve({ name, content: data });
      });
    });

    uploadFilesPromises.push(promise);
  });

  return Promise.all(uploadFilesPromises);
};
