#!/bin/bash

cat > ./src/infra/database/seeds/$(date +"%Y%m%d%H%M%S")-$1.ts << EOF
import { QueryInterface } from 'sequelize';
module.exports = {
  // tslint:disable-next-line:variable-name
  up: async (queryInterface: QueryInterface) => {
  // Write seed code here.
  },
  // tslint:disable-next-line:variable-name
  down: async (queryInterface: QueryInterface) => {
  // If seed fails, this will be called. Rollback your seed changes.
  },
};
EOF
