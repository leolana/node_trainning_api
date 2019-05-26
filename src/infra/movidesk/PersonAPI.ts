import { MovideskPerson } from './PersonTypes';

// Expressões OData

// Implemantação básica. Se necessário, verificar uma forma de implementar o OData por completo
export type FilterExpression = {
  field: string;
  op: 'eq' | 'ne' | 'gt' | 'lt' | 'ge' | 'le';
  value: any;
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
  find: (id: string) => Promise<MovideskPerson>;
  list: (
    filter?: FilterExpression[],
    orderBy?: OrderExpression[],
    top?: number,
    skip?: number,
    select?: string[],
    expand?: Expand[]
  ) => Promise<MovideskPerson[]>;
  create: (data: MovideskPerson, returnAllProperties?: boolean) => Promise<MovideskPerson>;
  update: (id: string, data: MovideskPerson) => Promise<void>;
}

export default PersonAPI;
