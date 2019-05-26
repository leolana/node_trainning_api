import { LoggerInterface } from '../logging';
import { Environment } from '../environment/Environment';

import container from '../../container';
import types from '../../constants/types';

export function banner(log: LoggerInterface): void {
  const config = container.get<Environment>(types.Environment);

  if (config.app.banner) {
    const route = () => `${config.app.uri}:${config.app.port}`;
    log.info('');
    log.info(`Hi, your app is ready on ${route()}`);
    log.info('To shut it down, press <CTRL> + C at any time.');
    log.info('');
    log.info('-------------------------------------------------------');
    log.info(`Environment : ${config.node}`);
    log.info(`Version     : ${config.app.version}`);
    log.info('');
    log.info(`Api Doc     : ${route()}`);
    log.info(`Check ♥     : ${route()}${config.healthCheck.route}`);
    if (config.swagger.enabled) {
      log.info(`Swagger     : ${config.app.uri}:${config.app.port}${config.swagger.route}`);
    }
    if (config.monitor.enabled) {
      log.info(`Monitor     : ${config.app.uri}:${config.app.port}${config.monitor.route}`);
    }
    log.info('-------------------------------------------------------');
    log.info('');
  } else {
    log.info('Application is up and running.');
  }
}
