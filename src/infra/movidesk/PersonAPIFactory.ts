import { interfaces } from 'inversify';

import PersonAPI from './PersonAPI';
import PersonAPIDev from './PersonAPIDev';
import PersonAPIProd from './PersonAPIProd';
import { Environment } from '../environment/Environment';

import types from '../../constants/types';

class PersonAPIFactory {
  private context: interfaces.Context;

  constructor(
    context: interfaces.Context
  ) {
    this.context = context;
  }

  create(): PersonAPI {
    const config = this.context.container.get<Environment>(types.Environment);

    const personAPI: PersonAPI = (config.isDevelopment || config.isTesting) && config.movidesk.enableMock
      ? this.context.container.get<PersonAPIDev>(types.PersonAPIDev)
      : this.context.container.get<PersonAPIProd>(types.PersonAPIProd);

    return personAPI;
  }
}

export default PersonAPIFactory;
