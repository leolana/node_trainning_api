import { injectable, inject } from 'inversify';
import * as request from 'request-promise-native';

import { PersonAPI, FilterExpression, OrderExpression, Expand } from './PersonAPI';
import { MovideskPerson } from './PersonTypes';
import { LoggerInterface } from '../logging';
import { Environment, MovideskEnv } from '../environment/Environment';

import types from '../../constants/types';

@injectable()
class PersonAPIProd implements PersonAPI {
  private settings: MovideskEnv;

  constructor(
    @inject(types.Logger) private logger: LoggerInterface,
    @inject(types.Environment) config: Environment
  ) {
    this.settings = config.movidesk;
  }

  get token() {
    return this.settings.token;
  }

  private generateExpandQuery(expands: Expand[]): string {
    return expands.map((e) => {
      const innerExpands = e.expands || [];
      let innerString = '';

      if (innerExpands.length > 0) {
        innerString = `$expand=(${this.generateExpandQuery(innerExpands)})`;
      }

      return `${e.field}${innerString}`;
    }).join(',');
  }

  public async find(id: string): Promise<MovideskPerson> {
    this.logger.info('Movidesk PersonAPIProd.find');

    return request({
      uri: `${this.settings.address}/persons`,
      method: 'GET',
      qs: {
        id,
        token: this.token
      },
      json: true
    });
  }

  public async list(
    filter?: FilterExpression[],
    orderBy?: OrderExpression[],
    top?: number,
    skip?: number,
    select?: string[],
    expand?: Expand[]
  ): Promise<MovideskPerson[]> {
    this.logger.info('Movidesk PersonAPIProd.list');

    const query: any = {
      token: this.token
    };

    if (filter) {
      query.$filter = filter.map(f => `${f.field} ${f.op} '${f.value}'`).join(' and ');
    }
    if (orderBy) {
      query.$orderBy = orderBy.map(o => `${o.field} ${o.order || 'asc'}`).join(',');
    }
    if (top) {
      query.$top = top;
    }
    if (skip) {
      query.$skip = skip;
    }
    if (select) {
      query.$select = select.join(',');
    }
    if (expand) {
      query.$expand = this.generateExpandQuery(expand);
    }

    return request({
      uri: `${this.settings.address}/persons`,
      method: 'GET',
      qs: query,
      json: true
    });
  }

  public async create(data: MovideskPerson, returnAllProperties = false) {
    this.logger.info('Movidesk PersonAPIProd.create');

    return request({
      uri: `${this.settings.address}/persons`,
      method: 'POST',
      qs: {
        returnAllProperties,
        token: this.token
      },
      body: data,
      json: true
    });
  }

  public async update(id: string, data: MovideskPerson) {
    this.logger.info('Movidesk PersonAPIProd.update');

    return request({
      uri: `${this.settings.address}/persons`,
      method: 'PATCH',
      qs: {
        id,
        token: this.token
      },
      body: data,
      json: true
    });
  }
}

export default PersonAPIProd;
