/* eslint-disable prefer-promise-reject-errors */

function convertCertificate(cert) {
  const beginCert = '-----BEGIN PUBLIC KEY-----';
  const endCert = '-----END PUBLIC KEY-----';

  cert = cert.replace('\n', '');
  cert = cert.replace(beginCert, '');
  cert = cert.replace(endCert, '');

  let result = beginCert;
  while (cert.length > 0) {
    if (cert.length > 64) {
      result += `\n${cert.substring(0, 64)}`;
      cert = cert.substring(64, cert.length);
    } else {
      result += `\n${cert}`;
      cert = '';
    }
  }

  if (result[result.length] !== '\n') result += '\n';
  result += `${endCert}\n`;
  return result;
}

module.exports = (di) => {
  di.provide(
    '@auth-settings',
    () => new Promise((resolve, reject) => {
      const settings = {
        address: process.env.ALPE_KEYCLOAK_ADDRESS,
        adminUsername: process.env.ALPE_KEYCLOAK_ADMIN_USERNAME,
        adminPassword: process.env.ALPE_KEYCLOAK_ADMIN_PASSWORD,
        clientId: process.env.ALPE_KEYCLOAK_CLIENT_ID,
        clientSecret: process.env.ALPE_KEYCLOAK_CLIENT_SECRET,
        clientUUID: process.env.ALPE_KEYCLOAK_CLIENT_UUID,
        publicKey: process.env.ALPE_KEYCLOAK_PUBLIC_KEY,
        realm: process.env.ALPE_KEYCLOAK_REALM,
        baseUrl: process.env.ALPE_URL,
      };

      if (
        !settings.address
        || !settings.clientId
        || !settings.clientSecret
        || !settings.publicKey
        || !settings.realm
        || !settings.adminUsername
        || !settings.adminPassword
        || !settings.clientUUID
        || !settings.baseUrl
      ) {
        reject('KEYCLOAK ENVIRONMENT VARIABLES NOT DEFINED!');
      } else {
        settings.publicKey = convertCertificate(settings.publicKey);
        resolve(settings);
      }
    }),
  )
    .provide(
      '@internal-apis-settings',
      () => new Promise((resolve, reject) => {
        const addressBancos = process.env.ALPE_APIS_BANCOS_ADDRESS;
        const addressCEPs = process.env.ALPE_APIS_CEPS_ADDRESS;

        const financial = {
          login: process.env.ALPE_APIS_FINANCIAL_LOGIN,
          pwd: process.env.ALPE_APIS_FINANCIAL_PWD,
          address: process.env.ALPE_APIS_FINANCIAL_ADDRESS,
        };

        if (
          !addressBancos
          || !addressCEPs
          || !financial.login
          || !financial.pwd
          || !financial.address
        ) {
          reject('INTERNAL APIS ENVIRONMENT VARIABLES NOT DEFINED!');
        } else {
          resolve({
            addressBancos,
            addressCEPs,
            financial: {
              auth: Buffer.from(
                `${financial.login}:${financial.pwd}`,
              ).toString('base64'),
              address: financial.address,
            },
          });
        }
      }),
    )
    .provide(
      '@storage-settings',
      () => new Promise((resolve, reject) => {
        const region = process.env.ALPE_STORAGE_REGION;
        const bucket = process.env.ALPE_STORAGE_BUCKET;

        if (!region || !bucket) {
          reject('STORAGE ENVIRONMENT VARIABLES NOT DEFINED!');
        } else {
          resolve({ region, bucket });
        }
      }),
    )
    .provide(
      '@db-settings',
      () => new Promise((resolve, reject) => {
        const mainDbConnection = process.env.ALPE_CONNECTION_STRING;
        const enableSync = process.env.ALPE_DATABASE_SYNC;
        const enableLogging = process.env.ALPE_DATABASE_LOGGING;

        if (!mainDbConnection) {
          reject(
            'MAIN DB CONNECTION STRING ENVIRONMENT VARIABLE NOT DEFINED!',
          );
        }

        if (!enableSync) {
          reject('ALPE DATABASE SYNC ENVIRONMENT VARIABLE NOT DEFINED!');
        } else {
          resolve({
            mainDb: { connection: mainDbConnection, logging: enableLogging },
            enableSync,
          });
        }
      }),
    )
    .provide(
      '@log-settings',
      () => new Promise((resolve) => {
        const settings = {
          stdoutLevel: process.env.ALPE_LOGS_STDOUT_LEVEL || 'info',
          stderrLevel: process.env.ALPE_LOGS_STDERR_LEVEL || 'error',
        };

        resolve(settings);
      }),
    )
    .provide(
      '@siscof-settings',
      () => new Promise((resolve) => {
        const settings = {
          user: process.env.ALPE_SISCOF_USER,
          password: process.env.ALPE_SISCOF_PASSWORD,
          connectString: process.env.ALPE_SISCOF_CONNECTSTRING,
        };

        resolve(settings);
      }),
    )
    .provide(
      '@mailer-settings',
      () => new Promise((resolve, reject) => {
        const region = process.env.ALPE_SES_REGION;
        const origin = process.env.ALPE_MAILER_ORIGIN;
        const baseUrl = process.env.ALPE_URL;
        const mailingList = process.env.ALPE_MAILING_LIST;

        if (!origin) {
          reject('MAILER ORIGIN ENVIRONMENT VARIABLE NOT DEFINED!');
        } else if (!region) {
          reject('ALPE SES REGION ENVIRONMENT VARIABLE NOT DEFINED!');
        } else if (!baseUrl) {
          reject('ALPE URL ENVIRONMENT VARIABLE NOT DEFINED!');
        } else if (!mailingList) {
          reject('ALPE ADMINISTRATOR MAILING LIST NOT DEFINED!');
        } else {
          resolve({
            region,
            origin,
            baseUrl,
            mailingList: mailingList.split(';'),
          });
        }
      }),
    )
    .provide(
      '@sentry-settings',
      () => new Promise((resolve, reject) => {
        const sentryDSN = process.env.ALPE_SENTRY_DSN;

        if (!sentryDSN) {
          reject('ALPE SENTRY DSN VARIABLE NOT DEFINED!');
        }

        const settings = {
          dsn: sentryDSN,
          environment: 'production',
        };

        resolve(settings);
      }),
    );
};
