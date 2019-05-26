import * as path from 'path';
import * as SequelizeMock from 'sequelize-mock';
import FactoriesLoader from './FactoriesLoader';

const dbConnectionMock = new SequelizeMock();

const databaseMock = FactoriesLoader.load({
  dbConnectionMock,
  baseFolder: path.join(__dirname, 'factories')
});

export default databaseMock;
