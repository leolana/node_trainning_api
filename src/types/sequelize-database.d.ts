// tslint:disable:no-implicit-dependencies
// tslint:disable:function-name
// tslint:disable:no-namespace

import { Model, DataTypes as SequelizeDataTypes, Sequelize as Base } from 'sequelize';

declare function s(): Base;

declare namespace s {
    export interface Sequelize extends Base {
      entities: { [id: string]: Model<any, any> };
    }

    export type DataTypes = SequelizeDataTypes;

}

export = s;
