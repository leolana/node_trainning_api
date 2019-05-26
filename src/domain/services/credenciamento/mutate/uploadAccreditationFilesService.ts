import mapFiles from '../../file/mapFiles';
import { FileStorage } from '../../../../infra/fileStorage';
import deformatDocument from '../deformatDocument';

const uploadAccreditationFilesService = (
  fileStorage: FileStorage
) =>

  /**
   * Usa a função (mapFiles) para pegar as propriedades necessárias dos arquivos.
   * Faz o upload de todos os arquivos usando o serviço (fileStorage.upload)
   *
   * @param arquivos array de arquivos
   * @param documento CPF ou CNPJ
   */
  async (
    arquivos: any[],
    documento: string
  ) => {

    const files = await mapFiles(
      arquivos,
      deformatDocument(documento),
      'credenciamento'
    );

    const fileUploads = await Promise.all(files.map((file) => {
      return fileStorage.upload(file.name, file.content);
    }));

    return fileUploads;

  };

export default uploadAccreditationFilesService;
