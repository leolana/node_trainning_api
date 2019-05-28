import { QueryInterface } from 'sequelize';
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS unaccent;');
  },
  down: async (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.query('DROP EXTENSION IF NOT EXISTS unaccent;');
  },
};
