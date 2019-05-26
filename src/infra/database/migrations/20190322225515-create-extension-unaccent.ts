import { QueryInterface, SequelizeStatic } from 'sequelize';
module.exports = {
  up: async (queryInterface: QueryInterface, sequelize: SequelizeStatic) => {
    return queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS unaccent;');
  },
  down: async (queryInterface: QueryInterface, sequelize: SequelizeStatic) => {
    return queryInterface.sequelize.query('DROP EXTENSION IF NOT EXISTS unaccent;');
  },
};
