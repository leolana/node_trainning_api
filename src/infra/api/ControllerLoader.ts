import * as fs from 'fs';
import * as path from 'path';

import container from '../../container';
import Controller from '../../interfaces/rest/Controller';

const CONTROLLERS_PATH = `${__dirname}/../../interfaces/rest/controllers/`;

const controllerLoader = {
  load() {
    const FILE_EXTENSION_INDEX = -3;

    const routes = fs
      .readdirSync(CONTROLLERS_PATH)
      .filter((file) => {
        const fileExtension = file.slice(FILE_EXTENSION_INDEX);
        return (file.indexOf('.') !== 0) && (fileExtension === '.js' || fileExtension === '.ts');
      })
      .map((file) => {
        const controllerFile = require(path.join(CONTROLLERS_PATH, file));
        const controller = container.resolve(controllerFile.default) as Controller;

        return controller.router;
      });

    return routes;
  }
};

export default controllerLoader;
