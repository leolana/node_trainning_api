import { interfaces } from 'inversify';

import Mailer from './Mailer';
import MailerDev from './MailerDev';
import MailerAWS from './MailerAWS';
import { Environment } from '../environment/Environment';

import types from '../../constants/types';

class MailerFactory {
  private context: interfaces.Context;

  constructor(
    context: interfaces.Context
  ) {
    this.context = context;
  }

  create(): Mailer {
    const config = this.context.container.get<Environment>(types.Environment);

    const mailer: Mailer = (config.isDevelopment || config.isTesting) && config.mailer.enableMock
      ? this.context.container.get<MailerDev>(types.MailerDev)
      : this.context.container.get<MailerAWS>(types.MailerAWS);

    return mailer;
  }
}

export default MailerFactory;
