import { injectable } from 'inversify';
import * as uuid from 'uuid';

import { PersonAPI, FilterExpression, OrderExpression, Expand } from './PersonAPI';
import { Person  } from './PersonTypes';

@injectable()
class PersonAPIDev implements PersonAPI {
  private getPerson(id: string): Person {
    return {
      id,
      isActive: true,
      personType: 2,
      profileType: 2,
      businessName: 'IT Lab Brasil',
      cpfCnpj: '00000000000100',
      userName: 'mock',
      cultureId: 'pt-BR',
      timeZoneId: 'America/Sao_Paulo',
      createdDate: new Date(),
      createdBy: 'user',
      addresses: [{
        addressType: 'Comercial',
        country: 'Brazil',
        postalCode: '00000000',
        state: 'São Paulo',
        city: 'São Paulo',
        district: 'Itaim Bibi',
        street: 'Rua Tabapuã',
        number: '145',
        complement: '9o andar',
        isDefault: true
      }],
      contacts: [{
        contact: '11111111',
        contactType: 'Telefone',
        isDefault: true
      }, {
        contact: '222222222',
        contactType: 'Celular',
        isDefault: false
      }],
      emails: [{
        email: 'mock@mock.com',
        emailType: 'Profissional',
        isDefault: true
      }]
    };
  }

  public async find(id: string) {
    return this.getPerson(id);
  }

  public async list(
    filter?: FilterExpression[],
    orderBy?: OrderExpression[],
    top?: number,
    skip?: number,
    select?: string[],
    expand?: Expand[]
  ) {
    return [this.getPerson(uuid.v4())];
  }

  public async create(data: Person, returnAllProperties?: boolean) {
    const newId = uuid.v4();

    if (returnAllProperties) {
      data.id = newId;
      return data;
    }

    return { id: newId } as Person;
  }

  public async update(id: string, data: Person) {
    return;
  }
}

export default PersonAPIDev;
