import * as fs from 'fs';
import * as path from 'path';

const factoriesLoader = {
  load({ dbConnectionMock, baseFolder }) {
    const FILE_EXTENSION_INDEX = -3;
    const factoriesLoaded: any = {};

    fs
      .readdirSync(baseFolder)
      .filter((file) => {
        const fileExtension = file.slice(FILE_EXTENSION_INDEX);
        return (file.indexOf('.') !== 0) && (fileExtension === '.js' || fileExtension === '.ts');
      })
      .forEach((file) => {
        const factoryPath = path.join(baseFolder, file);
        const factory = require(factoryPath).default;

        const factoryName = file.split('.')[0];
        factoriesLoaded[factoryName] = factory(dbConnectionMock);
      });

    dbConnectionMock.entities = factoriesLoaded;

    return dbConnectionMock;
  }
};

export default factoriesLoader;
