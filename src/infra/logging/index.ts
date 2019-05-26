import { winstonLoader } from './WinstonLoader';
import Logger from './Logger';

const winstonLogger = winstonLoader();
const logger = new Logger(winstonLogger);

export default logger;
export * from './LoggerInterface';
