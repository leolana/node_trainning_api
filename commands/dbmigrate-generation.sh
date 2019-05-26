#!/bin/bash

cat > ./src/infra/database/migrations/$(date +"%Y%m%d%H%M%S")-$1.ts << EOF
import { QueryInterface, SequelizeStatic } from 'sequelize';
module.exports = {
  // tslint:disable-next-line:variable-name
  up: async (queryInterface: QueryInterface, sequelize: SequelizeStatic) => {
  // Write migration code here.
  },
  // tslint:disable-next-line:variable-name
  down: async (queryInterface: QueryInterface, sequelize: SequelizeStatic) => {
  // If migration fails, this will be called. Rollback your migration changes.
  },
};
EOF
