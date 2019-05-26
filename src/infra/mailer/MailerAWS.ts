import * as nodemailer from 'nodemailer';
import * as AWS from 'aws-sdk';
import { injectable, inject } from 'inversify';
import * as Email from 'email-templates';

import emailTemplates from './emailTemplates';
import { LoggerInterface } from '../logging';
import { Environment, MailerEnv } from '../environment/Environment';
import { validateEmailSubject, Mailer } from './Mailer';

import types from '../../constants/types';

@injectable()
class MailerAWS implements Mailer {
  private settings: MailerEnv;
  private logger: any;

  constructor(
    @inject(types.Logger) logger: LoggerInterface,
    @inject(types.Environment) config: Environment
  ) {
    this.settings = config.mailer;
    this.logger = logger;
  }

  get emailTemplates() {
    return emailTemplates;
  }
  enviar = (mailOptions): Promise<any | void> => {
    const { templateName, destinatary, substitutions } = mailOptions;
    const locals = Object.assign(substitutions, { baseUrl: this.settings.baseUrl });

    return new Promise((resolve, reject) => {
      const templateExistenteEncontrado = Object.keys(emailTemplates)
          .map(key => emailTemplates[key])
          .filter(t => t === templateName);

      if (!templateExistenteEncontrado.length) {
        return reject(`TEMPLATE EMAIL NAME ${templateName} NOT DEFINED!`);
      }

      AWS.config.update({
        region: this.settings.region
      });

      const email = new Email({
        views: { root: `${__dirname}/emails` },
        juice: true,
        juiceResources: {
          preserveImportant: true,
          webResources: {
            relativeTo: `${__dirname}/emails`
          }
        }
      });

      const transporter = nodemailer.createTransport(
        { SES: new AWS.SES({ apiVersion: '2010-12-01' }) },
        {
          attachments: [{
            filename: 'logo-alpe-negativo.jpg',
            path: `${__dirname}/emails/logo-alpe-negativo.jpg`,
            cid: 'logo',
            contentDisposition: 'inline'
          }]
        }
      );

      Promise.all([
        email.render(`${templateName}/html`, locals),
        email.render(`${templateName}/subject`, locals)
      ]).then(([html, subject]) => {
        const sendMailAWSOptions = {
          html,
          subject: validateEmailSubject(subject),
          from: this.settings.origin,
          to: destinatary,
          ses: {}
        };

        transporter.sendMail(sendMailAWSOptions, (error, data) => {
          if (error) {
            this.logger.error(error);
            reject(error);
          } else {
            resolve(data);
          }
        });
      }).catch((error) => {
        this.logger.error(error);
        reject(error);
      });
    });
  }
}

export default MailerAWS;
