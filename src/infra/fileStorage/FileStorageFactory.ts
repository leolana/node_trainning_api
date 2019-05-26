import { interfaces } from 'inversify';

import FileStorage from './FileStorage';
import FileStorageDev from './FileStorageDev';
import FileStorageAWS from './FileStorageAWS';

import types from '../../constants/types';
import { config } from '../../config';

class FileStorageFactory {
  private context: interfaces.Context;

  constructor(
    context: interfaces.Context
  ) {
    this.context = context;
  }

  create(): FileStorage {
    const fileStorage: FileStorage = (config.isDevelopment || config.isTesting) && config.storage.enableMock
      ? this.context.container.get<FileStorageDev>(types.FileStorageDev)
      : this.context.container.get<FileStorageAWS>(types.FileStorageAWS);

    return fileStorage;
  }
}

export default FileStorageFactory;
