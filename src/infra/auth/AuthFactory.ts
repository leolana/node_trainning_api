import { interfaces } from 'inversify';

import Auth from './Auth';
import AuthDev from './AuthDev';
import AuthProd from './AuthProd';
import { LoggerInterface } from '../logging';

import types from '../../constants/types';
import { config } from '../../config';
import * as Exceptions from '../../interfaces/rest/exceptions/ApiExceptions';
import * as Errors from '../../interfaces/rest/errors/ApiErrors';

class AuthFactory {
  constructor(
    private context: interfaces.Context
  ) { }

  create(): Auth {
    const auth: Auth = (config.isDevelopment || config.isTesting) && config.auth.enableMock
      ? this.context.container.get<AuthDev>(types.AuthDev)
      : this.context.container.get<AuthProd>(types.AuthProd);

    this.manageKeycloakErrorMessages(auth);
    auth.getRolesIds().catch((e: any) => console.error(e));

    return auth;
  }

  manageKeycloakErrorMessages(auth: Auth): any {
    const logger: LoggerInterface = this.context.container.get<LoggerInterface>(types.Logger);
    const ourCustomExceptions = Object.values(Exceptions);

    const methodsWithKeycloakAccess: any[] = [
      'authenticateAsAdmin',
      'generateSessionToken',
      'changeUserRoles',
      'getRolesIds',
      'authenticate',
      'refreshToken',
      'inviteUser',
      'createUser',
      'updateUserData',
      'updateUserStatus',
      'changeUserPassword',
      'getUser',
      'putUser'
    ];

    methodsWithKeycloakAccess.forEach((method) => {
      const originalFunction = auth[method];

      if (!originalFunction || (typeof originalFunction !== 'function')) {
        throw new Errors.NotAcceptableError(method);
      }

      auth[method] = async function () {
        try {
          return await originalFunction.apply(this, arguments);
        } catch (error) {
          if (ourCustomExceptions.some(customException => error instanceof customException)) {
            throw error;
          }

          logger.error(error);
          throw new Exceptions.KeycloakException(method);
        }
      };
    });
  }

}

export default AuthFactory;
