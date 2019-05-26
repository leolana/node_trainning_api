import { injectable, inject } from 'inversify';

import emailTemplates from './emailTemplates';
import Mailer from './Mailer';
import { LoggerInterface } from '../logging';

import types from '../../constants/types';

@injectable()
class MailerDev implements Mailer {
  private logger: LoggerInterface;

  constructor(
    @inject(types.Logger) logger: LoggerInterface,
  ) {
    this.logger = logger;
  }

  get emailTemplates() {
    return emailTemplates;
  }
  enviar = (...args): Promise<any | void> => {
    this.logger.info('enviar email ', args);
    return Promise.resolve();
  }
}

export default MailerDev;
