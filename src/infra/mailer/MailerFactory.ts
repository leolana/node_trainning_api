import { interfaces } from 'inversify';

import Mailer from './Mailer';
import MailerDev from './MailerDev';
import MailerAWS from './MailerAWS';

import types from '../../constants/types';
import { config } from '../../config';

class MailerFactory {
  private context: interfaces.Context;

  constructor(
    context: interfaces.Context
  ) {
    this.context = context;
  }

  create(): Mailer {
    const mailer: Mailer = (config.isDevelopment || config.isTesting) && config.mailer.enableMock
      ? this.context.container.get<MailerDev>(types.MailerDev)
      : this.context.container.get<MailerAWS>(types.MailerAWS);

    return mailer;
  }
}

export default MailerFactory;
