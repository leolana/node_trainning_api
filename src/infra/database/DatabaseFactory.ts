import { interfaces } from 'inversify';
import * as Sequelize from 'sequelize';
import { Sequelize as DB } from 'sequelize-database';

import ModelsLoader from './ModelsLoader';
import { Environment } from '../environment/Environment';

import types from '../../constants/types';

const modelPath = `${__dirname}/models`;

const { Op } = Sequelize;
const operatorsAliases = {
  $eq: Op.eq,
  $ne: Op.ne,
  $gte: Op.gte,
  $gt: Op.gt,
  $lte: Op.lte,
  $lt: Op.lt,
  $not: Op.not,
  $in: Op.in,
  $notIn: Op.notIn,
  $is: Op.is,
  $like: Op.like,
  $notLike: Op.notLike,
  $iLike: Op.iLike,
  $notILike: Op.notILike,
  $regexp: Op.regexp,
  $notRegexp: Op.notRegexp,
  $iRegexp: Op.iRegexp,
  $notIRegexp: Op.notIRegexp,
  $between: Op.between,
  $notBetween: Op.notBetween,
  $overlap: Op.overlap,
  $contains: Op.contains,
  $contained: Op.contained,
  $adjacent: Op.adjacent,
  $strictLeft: Op.strictLeft,
  $strictRight: Op.strictRight,
  $noExtendRight: Op.noExtendRight,
  $noExtendLeft: Op.noExtendLeft,
  $and: Op.and,
  $or: Op.or,
  $any: Op.any,
  $all: Op.all,
  $values: Op.values,
  $col: Op.col,
};

class DatabaseFactory {
  private context: interfaces.Context;

  constructor(
    context: interfaces.Context
  ) {
    this.context = context;
  }
  create(): DB {
    const config = this.context.container.get<Environment>(types.Environment);

    const sequelize = new Sequelize(
      config.db.connection,
      {
        operatorsAliases,
        logging: config.db.logging ? console.log : false,
        define: {
          freezeTableName: true
        }
      });

    return ModelsLoader.load(
      (sequelize as DB),
      modelPath,
    );

  }
}

export default DatabaseFactory;
