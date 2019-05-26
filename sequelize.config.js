require('dotenv').config();

module.exports = {
  development: {
    url: process.env.ALPE_CONNECTION_STRING,
    dialect: 'postgres'
  },
  testing: {
    url: process.env.ALPE_CONNECTION_STRING,
    dialect: 'postgres'
  },
};
