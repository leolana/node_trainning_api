const emailTemplates = require('../../service/mailer/emailTemplates.enum');

module.exports = (di) => {
  di.provide('@@email-templates', () => Promise.resolve(emailTemplates));
};
