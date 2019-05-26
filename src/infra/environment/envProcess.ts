// tslint:disable:no-parameter-reassignment
// tslint:disable:no-magic-numbers

import { join } from 'path';

export function getOsEnv(key: string): string {
  if (typeof process.env[key] === 'undefined') {
    throw new Error(`Environment variable ${key} is not set.`);
  }

  return process.env[key];
}

export function getOsEnvOptional(key: string): string | undefined {
  return process.env[key];
}

export function getPath(path: string): string {
  const position = -3;
  return process.env.NODE_ENV === 'production'
    ? join(process.cwd(), `${path.replace('src/', 'dist/src/').slice(0, position)}.js`)
    : join(process.cwd(), path);
}

export function getPaths(paths: string[]): string[] {
  return paths.map(p => getPath(p));
}

export function getOsPath(key: string): string {
  return getPath(getOsEnv(key));
}

export function getOsPaths(key: string): string[] {
  return getPaths(getOsEnvArray(key));
}

export function getOsEnvArray(key: string, delimiter: string = ','): string[] {
  return (process.env[key] && process.env[key].split(delimiter)) || [];
}

export function toNumber(value: string): number {
  return parseInt(value, 10);
}

export function toBool(value: string): boolean {
  return value === 'true';
}

export function normalizePort(port: string): number | string | boolean {
  const parsedPort = parseInt(port, 10);
  if (isNaN(parsedPort)) {
    // named pipe
    return port;
  }
  if (parsedPort >= 0) {
    // port number
    return parsedPort;
  }
  return false;
}

export function convertCertificate(cert) {
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