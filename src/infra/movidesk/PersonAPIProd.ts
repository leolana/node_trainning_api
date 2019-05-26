import { injectable } from 'inversify';
import * as request from 'request-promise-native';

import { config } from '../../config';
import { PersonAPI, FilterExpression, OrderExpression, Expand } from './PersonAPI';
import { Person } from './PersonTypes';

@injectable()
class PersonAPIProd implements PersonAPI {
  private settings = config.movidesk;

  private async getToken() {
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

  public async find(id: string): Promise<Person> {
    const token = await this.getToken();
    return request({
      uri: `${this.settings.address}/persons`,
      method: 'GET',
      qs: {
        token,
        id
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
  ): Promise<Person[]> {
    const query = {
      $filter: undefined,
      $orderBy: undefined,
      $top: undefined,
      $skip: undefined,
      $select: undefined,
      $expand: undefined
    };

    if (filter) {
      query.$filter = filter.map(f => `${f.field} ${f.op} ${f.value}`).join(' and ');
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

    const token = await this.getToken();

    return request({
      uri: `${this.settings.address}/persons`,
      method: 'GET',
      qs: {
        token,
        ...query
      },
      json: true
    });
  }

  public async create(data: Person, returnAllProperties?: boolean) {
    const token = await this.getToken();
    return request({
      uri: `${this.settings.address}/persons`,
      method: 'POST',
      qs: {
        token,
        returnAllProperties: returnAllProperties || false
      },
      body: data,
      json: true
    });
  }

  public async update(id: string, data: Person) {
    const token = await this.getToken();
    return request({
      uri: `${this.settings.address}/persons`,
      method: 'PATCH',
      qs: {
        token,
        id
      },
      body: data,
      json: true
    });
  }
}

export default PersonAPIProd;
