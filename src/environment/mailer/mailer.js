const nodemailer = require('nodemailer');
let AWS = require('aws-sdk');
const Email = require('email-templates');

module.exports = di => {
    di.provide('$mailer', '@mailer-settings', '@@email-templates', '$logger', mailer);
};

function mailer(settings, emailTemplates, logger) {
    this.enviar = (mailOptions) => {
        const { templateName, destinatary, substitutions } = mailOptions;
        const locals = Object.assign(substitutions, { baseUrl: settings.baseUrl });

        return new Promise((resolve, reject) => {
            const templateExistenteEncontrado = Object.keys(emailTemplates)
                .map(key => emailTemplates[key])
                .filter(t => t === templateName);

            if (!templateExistenteEncontrado.length) {
                return reject(`TEMPLATE EMAIL NAME ${templateName} NOT DEFINED!`);
            }

            AWS.config.update({
                region: settings.region
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
                    from: settings.origin,
                    to: destinatary,
                    subject,
                    html,
                    ses: {}
                };

                transporter.sendMail(sendMailAWSOptions, (error, data) => {
                    if (error) {
                        logger.error(error);
                        reject(error);
                    }
                    else {
                        resolve(data);
                    }
                });
            }).catch((error) => {
                logger.error(error);
                reject(error);
            });
        });
    };

    return Promise.resolve(this);
};