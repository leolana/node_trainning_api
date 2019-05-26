import { injectable } from 'inversify';

import FileStorage from './FileStorage';

@injectable()
class FileStorageDev implements FileStorage {
  upload = (fileName): Promise<any> => {
    const obj = { key: fileName, Location: 'http://file-url' };
    return Promise.resolve(obj);
  }

  download = (filename): Promise<any> => {
    const obj = {
      ContentType: 'text/plain',
      Body: `test file for ${filename}`,
    };
    return Promise.resolve(obj);
  }
}

export default FileStorageDev;
