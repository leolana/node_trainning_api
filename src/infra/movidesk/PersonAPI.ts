import { Person } from './PersonTypes';

// Expressões OData

// Implemantação básica. Se necessário, verificar uma forma de implementar o OData por completo
export type FilterExpression = {
  field: string;
  op: 'eq' | 'ne' | 'gt' | 'lt' | 'ge' | 'le';
  value: string;
};

export type OrderExpression = {
  field: string;
  order?: 'asc' | 'desc';
};

export type Expand = {
  field: string,
  expands: Expand[]
};

export interface PersonAPI {
  find: (id: string) => Promise<Person>;
  list: (
    filter?: FilterExpression[],
    orderBy?: OrderExpression[],
    top?: number,
    skip?: number,
    select?: string[],
    expand?: Expand[]
  ) => Promise<Person[]>;
  create: (data: Person, returnAllProperties?: boolean) => Promise<Person>;
  update: (id: string, data: Person) => Promise<void>;
}

export default PersonAPI;
