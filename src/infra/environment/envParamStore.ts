// tslint:disable:no-parameter-reassignment
// tslint:disable:no-magic-numbers
import { SSM } from 'aws-sdk';

export function getOsEnv(params: SSM.Types.ParameterList, path: string, key: string): string {
  const parameterPath = `${path}${key}`;
  const param: SSM.Parameter = params.filter(p => p.Name === parameterPath)[0];
  if (typeof param === 'undefined' || typeof param.Value === 'undefined') {
    throw new Error(`Environment variable ${parameterPath} is not set.`);
  }

  return param.Value;
}

export function getOsEnvOptional(params: SSM.Types.ParameterList, path: string, key: string): string | undefined {
  const parameterPath = `${path}${key}`;
  const param: SSM.Parameter = params.filter(p => p.Name === parameterPath)[0];

  if (typeof param === 'undefined' || typeof param.Value === 'undefined') {
    return undefined;
  }

  return param.Value;
}

export function toNumber(value: string): number {
  return parseInt(value, 10);
}

export function toBool(value: string): boolean {
  return value === 'true';
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
