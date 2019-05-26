import * as fs from 'fs';
import * as path from 'path';

import { Sequelize } from 'sequelize-database';

const modelsLoader = {
  load(sequelize: Sequelize, baseFolder: string) {
    const modelsLoaded: any = {};
    const FILE_EXTENSION_INDEX = -3;

    fs
      .readdirSync(baseFolder)
      .filter((file) => {
        const fileExtension = file.slice(FILE_EXTENSION_INDEX);
        return (file.indexOf('.') !== 0) && (fileExtension === '.js' || fileExtension === '.ts');
      })
      .forEach((file) => {
        const model = sequelize.import(path.join(baseFolder, file));
        const modelName = file.split('.')[0];
        modelsLoaded[modelName] = model;
      });

    Object.keys(modelsLoaded).forEach((modelName) => {
      if (modelsLoaded[modelName].associate) {
        modelsLoaded[modelName].associate(modelsLoaded);
      }
    });

    sequelize.entities = modelsLoaded;

    return sequelize;
  }
};

export default modelsLoader;
