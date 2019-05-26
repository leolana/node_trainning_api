let Sequelize = require('sequelize');

const { Op } = Sequelize.Op;
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

module.exports = di => {
    let _configureDb = (dbname, settings, entities) => new Promise((resolve, reject) => {
        let db = new Sequelize(settings.connection, {
            logging: settings.logging ? console.log : false,
            operatorsAliases
        });

        db.entities = {};

        entities.forEach(i => {
            let options = { freezeTableName: true };

            if (i.validations)
                options.validate = i.validations;

            if (i.hasOwnProperty('timestamps'))
                options.timestamps = i.timestamps;

            db.entities[i.identity] = db.define(i.identity, i.attributes, options);
        });

        entities.forEach(i => {
            for (let type in i.associations) {
                let association = i.associations[type];

                for (let entityName in association) {
                    let entity = db.entities[entityName];
                    let options = association[entityName];

                    if (options && options.through)
                        options.through = db.entities[options.through] || options.through;

                    db.entities[i.identity][type](entity, options);
                }
            }

            for (let method in i.methods)
                db.entities[i.identity].prototype[method] = i.methods[method];
        });

        db.authenticate()
            .then(() => resolve(db))
            .catch((e) => reject(`Could not connect to ${dbname}. ${e}`));
    });

    di.provide('$main-db', '@db-settings', '.entities', (settings, entities) => {
        return _configureDb('Main-DB', settings.mainDb, entities);
    });
};
