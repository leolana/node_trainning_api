export const envParams = {
  log: {
    level: '/logs-stdout-level',
    output: '/logs-stderr-level',
  },
  db: {
    connection: '/pg-db-connection-string',
    logging: '/pg-db-logging',
  },
  siscof: {
    user: '/siscof-user',
    password: '/siscof-password',
    connectString: '/siscof-connectstring',
  },
  auth: {
    address: '/keycloak-address',
    adminUsername: '/keycloak-admin-username',
    adminPassword: '/keycloak-admin-password',
    clientId: '/keycloak-client-id',
    clientSecret: '/keycloak-client-secret',
    clientUUID: '/keycloak-client-uuid',
    publicKey: '/keycloak-public-key',
    realm: '/keycloak-realm',
    baseUrl: '/url-bko',
  },
  internalApis: {
    addressBancos: '/apis-bancos-address',
    addressCEPs: '/apis-ceps-address',
    financial: {
      login: '/apis-financial-login',
      password: '/apis-financial-pwd',
      address: '/apis-financial-address',
    },
  },
  movidesk: {
    address: '/movidesk-url',
    token: '/movidesk-token',
  },
  storage: {
    region: '/storage-region',
    bucket: '/storage-bucket',
  },
  mailer: {
    region: '/mailer-ses-region',
    origin: '/mailer-origin',
    baseUrl: '/url-bko',
    mailingList: '/mailer-mailing-list',
  },
  sentry: {
    dsn: '/sentry-dsn',
  },
};
