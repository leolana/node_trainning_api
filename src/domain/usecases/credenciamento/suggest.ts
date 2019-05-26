import deformatDocument from '../../services/credenciamento/deformatDocument';
import mapFiles from '../../services/file/mapFiles';
import applyFiles from '../../services/credenciamento/applyFiles';
import { PreAccreditationAlreadyExistsException } from '../../../interfaces/rest/exceptions/ApiExceptions';

const suggest = (db, fileStorage) => async (
  participantId,
  documento,
  name,
  personType,
  files,
  user
) => {
  const document = deformatDocument(documento);

  const credenciamento = await db.entities.credenciamentoProposta.findOne({
    where: {
      documento: document,
      participanteId: participantId,
    },
  });

  if (credenciamento) throw new PreAccreditationAlreadyExistsException();

  const savedFiles = await mapFiles(files, document, 'pre-credenciamento');

  const uploadedFiles = await Promise.all(savedFiles.map(
    file =>  fileStorage.upload(file.name, file.content)
  ));

  const propostaCredenciamento = {
    tipoPessoa: personType,
    nome: name,
    documento: document,
    arquivos: {
      extratosBancarios: [],
    },
    usuario: user,
    participanteId: participantId,
  };

  applyFiles(uploadedFiles, propostaCredenciamento);
  uploadedFiles.forEach((file) => {
    if (file.key.indexOf('extratosBancarios') >= 0) {
      propostaCredenciamento.arquivos.extratosBancarios.push(file);
    }
  });

  return db.entities.credenciamentoProposta.create(propostaCredenciamento);
};

export default suggest;
