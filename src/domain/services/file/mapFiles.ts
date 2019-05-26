import { DateTime } from 'luxon';

function removeDigits(input: string): string {
  return String(input).replace(/\d/g, '');
}

function mapFiles(files: any[], documento: string, processo: string): Promise<any[]> {
  // Necessário manter esse formato pois essa data será usada como URL
  // Não pode alterar, senão não conseguiremos buscar os arquivos existentes
  const timespan = DateTime.local().toUTC().toString().replace(/[\\:/.]/g, '-');

  const filesObjects = files.map((file: any) => {
    const fileType = removeDigits(file.fieldname);

    return {
      name: `${processo}/${documento}/${fileType}/${timespan}/${file.originalname}`,
      content: file.buffer
    };
  });

  return Promise.all(filesObjects);
}

export default mapFiles;
