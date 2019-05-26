/* eslint-disable max-len */
/* eslint-disable no-use-before-define */
/**
 * Windows: Please do not use trailing comma as windows will fail with token error
 */

const { series, rimraf } = require('nps-utils');
const { exec } = require('child_process');

module.exports = {
  scripts: {
    default: 'nps start',
    /**
     * Starts the builded app from the dist directory.
     */
    start: {
      script: series(
        'nps banner.serve',
        'cross-env NODE_ENV=production node --icu-data-dir=./../node_modules/full-icu/ dist/src/index.js'
      ),
      description: 'Starts the builded app',
    },
    /**
     * Serves the current app and watches for changes to restart it
     */
    serve: {
      inspector: {
        script: series(
          'nps banner.serve',
          'cross-env NODE_ENV=development NODE_ICU_DATA=./node_modules/full-icu/ nodemon --watch src --watch .env --inspect',
        ),
        description: 'Serves the current app and watches for changes to restart it, you may attach inspector to it.',
      },
      script: series(
        'nps banner.serve',
        'cross-env NODE_ENV=development NODE_ICU_DATA=./node_modules/full-icu/ nodemon --watch src --watch .env'
      ),
      description: 'Serves the current app and watches for changes to restart it',
    },
    watch: {
      node: {
        script: "cross-env NODE_ENV=development node --icu-data-dir=./node_modules/full-icu/ dist/src/index.js",
        description: 'Start the current app in development mode'
      },
      ts: {
        script:series(
          'nps build',
          'nps banner.watch',
          'nps watch.node',
        ),
        description: 'Build the current app to dev'
      },
      script: series(
        'nodemon --ext ts --watch src/ --watch .env --exec nps watch.ts',
      ),
      description: 'Watches for changes to restart the current app in development mode'
    },
    /**
     * Creates the needed configuration files
     */
    config: {
      script: series(runFast('./commands/tsconfig.ts')),
      hiddenFromHelp: true,
    },
    /**
     * Builds the app into the dist directory
     */
    build: {
      script: series(
        'nps banner.build',
        'nps config',
        'nps lint',
        'nps clean.dist',
        'nps transpile',
        // 'nps copy',
        'nps copy.tmp',
        'nps copy.emailTemplates',
        'nps clean.tmp',
      ),
      description: 'Builds the app into the dist directory',
    },
    /**
     * Runs TSLint over your project
     */
    lint: {
      watch: {
        script: watch('src', tslint('./src/**/*.ts')),
        hiddenFromHelp: true,
      },
      script: tslint('./src/**/*.ts'),
      hiddenFromHelp: true,
    },
    /**
     * Transpile your app into javascript
     */
    transpile: {
      script: 'tsc --project ./tsconfig.build.json',
      hiddenFromHelp: true,
    },
    /**
     * Clean files and folders
     */
    clean: {
      default: {
        script: series('nps banner.clean', 'nps clean.dist'),
        description: 'Deletes the ./dist folder',
      },
      dist: {
        script: rimraf('./dist'),
        hiddenFromHelp: true,
      },
      tmp: {
        script: rimraf('./.tmp'),
        hiddenFromHelp: true,
      },
      distMigrations: {
        script: rimraf('./dist-migrations'),
        hiddenFromHelp: true,
      },
      distSeeds: {
        script: rimraf('./dist/src/infra/database/seeds'),
        hiddenFromHelp: true,
      }
    },
    /**
     * Copies static files to the build folder
     */
    copy: {
      default: {
        script: series('nps copy.swagger'),
        hiddenFromHelp: true,
      },
      swagger: {
        script: copy('./src/infra/api/swagger.json', './dist/src'),
        hiddenFromHelp: true,
      },
      emailTemplates: {
        script: copyDir(
          './src/infra/mailer/emails',
          './dist/src/infra/mailer/emails'
        ),
        hiddenFromHelp: true,
      },
      tmp: {
        script: copyDir('./.tmp', './dist'),
        hiddenFromHelp: true,
      },
    },
    /**
    * These run various kinds of tests. Default is unit.
    */
    test: {
      default: 'nps test.unit',
      coverage: 'cross-env NODE_ENV=testing jest -i --coverage --runInBand',
      unit: {
        default: {
          script: series('nps banner.testUnit', 'nps test.unit.pretest', 'nps test.unit.run'),
          description: 'Runs the unit tests',
        },
        pretest: {
          script: tslint(`./test/unit/**.ts`),
          hiddenFromHelp: true,
        },
        run: {
          script: 'cross-env NODE_ENV=testing jest --testPathPattern=unit --maxWorkers=2',
          hiddenFromHelp: true,
        },
        verbose: {
          script: series('nps banner.testUnit', 'nps test.unit.pretest', 'nps "test.unit.run --verbose"'),
          hiddenFromHelp: true,
        },
        coverage: {
          script: series('nps banner.testUnit', 'nps test.unit.pretest', 'nps "test.unit.run --coverage --runInBand"'),
          hiddenFromHelp: true,
        },
      },
      integration: {
        default: {
          script: series('nps banner.testIntegration', 'nps test.integration.pretest', 'nps test.integration.run'),
          description: 'Runs the integration tests',
        },
        pretest: {
          script: tslint(`./test/integration/**.ts`),
          hiddenFromHelp: true,
        },
        run: {
          // -i. Run all tests serially in the current process, rather than creating a worker pool of child processes that run tests. This can be useful for debugging.
          script: 'cross-env NODE_ENV=testing jest --testPathPattern=integration -i',
          hiddenFromHelp: true,
        },
        verbose: {
          script: series('nps banner.testIntegration', 'nps test.integration.pretest', 'nps "test.integration.run --verbose"'),
          hiddenFromHelp: true,
        },
        coverage: {
          script: series('nps banner.testIntegration', 'nps test.integration.pretest', 'nps "test.integration.run --coverage --runInBand"'),
          hiddenFromHelp: true,
        },
      },
      e2e: {
        default: {
          script: series('nps banner.testE2E', 'nps test.e2e.pretest', 'nps test.e2e.run'),
          description: 'Runs the e2e tests',
        },
        pretest: {
          script: tslint(`./test/e2e/**.ts`),
          hiddenFromHelp: true,
        },
        run: {
          // -i. Run all tests serially in the current process, rather than creating a worker pool of child processes that run tests. This can be useful for debugging.
          script: 'cross-env NODE_ENV=testing jest --testPathPattern=e2e --detectOpenHandles -i',
          hiddenFromHelp: true,
        },
        verbose: {
          script: series('nps banner.testE2E', 'nps test.e2e.pretest', 'nps "test.e2e.run --verbose"'),
          hiddenFromHelp: true,
        },
        coverage: {
          script: series('nps banner.testE2E', 'nps test.e2e.pretest', 'nps "test.e2e.run --coverage --runInBand"'),
          hiddenFromHelp: true,
        },
      },
    },
    /**
    * Manage git secrets. Default is to check, run install at least once before
    * running it.
    */
    secrets: {
      install: {
        script: 'git secrets --register-aws',
        hiddenFromHelp: true
      },
      default: {
        script: 'git secrets --scan --cached --untracked',
        hiddenFromHelp: true
      }
    },
    /**
    * Used by precommit hook.
    */
    precommit: {
      script: series(
        'nps secrets',
        'nps lint'
      ),
      hiddenFromHelp: true
    },
    /**
     * Database scripts"
     */
    db: {
      migrate: {
        script: series(
          'nps banner.migrate',
          'nps config',
          'nps clean.distMigrations',
          runFast('./commands/migrate.ts'),
          build('src/infra/database/migrations/*.ts', './dist-migrations'),
          'cross-env NODE_ENV=development npx sequelize db:migrate',
          'nps clean.distMigrations'
        ),
        description: 'Migrates the database to newest version available',
      },
      migrate_generate: {
        script: series('nps banner.migrate_generate', 'sh ./commands/dbmigrate-generation.sh'),
        description: 'Migrate file generated to add migrations',
      },
      seed: {
        script: series(
          'nps banner.seed',
          'nps config',
          'nps clean.distSeeds',
          'nps build',
          'cross-env NODE_ENV=development npx sequelize db:seed:undo:all',
          'cross-env NODE_ENV=development npx sequelize db:seed:all',
          'nps clean.distSeeds'
        ),
        description: 'Seeds generated records into the database',
      },
      seed_generate: {
        script: series('nps banner.seed_generate', 'sh ./commands/dbseed-generation.sh'),
        description: 'Seed file generated to add seeds',
      },
      drop: {
        script: series('nps banner.dbDrop', 'cross-env NODE_ENV=development npx sequelize db:drop'),
        description: 'Drops the schema of the database',
      },
      create: {
        script: series('nps banner.dbCreate', 'cross-env NODE_ENV=development npx sequelize db:create'),
        description: 'Creates the schema of the database',
      },
      sync: {
        script: series(
          'cross-env NODE_ENV=development',
          'nps db.migrate',
          'nps db.seed'
        ),
        description: 'Recreates database objects with seeded data',
      },
      setup: {
        script: series(
          'cross-env NODE_ENV=development',
          'nps db.drop ; nps db.create',
          'nps db.sync',
        ),
        description: 'Recreates the database with seeded data',
      },
    },
    /**
     * This creates pretty banner to the terminal
     */
    banner: {
      build: banner('build'),
      serve: banner('serve'),
      watch: banner('watch'),
      clean: banner('clean'),
      seed_generate: banner('seed-gen'),
      migrate_generate: banner('migrate-gen'),
      seed: banner('db.seed'),
      migrate: banner('db.migrate'),
      dbDrop: banner('db.drop'),
      dbCreate: banner('db.create'),
      testUnit: banner('test.unit'),
      testIntegration: banner('test.integration'),
      testE2E: banner('test.e2e'),
    },
  },
};

function banner(name) {
  return {
    hiddenFromHelp: true,
    silent: true,
    description: `Shows ${name} banners to the console`,
    script: runFast(`./commands/banner.ts ${name}`),
  };
}

function copy(source, target) {
  return `copyfiles --up 1 ${source} ${target}`;
}

function copyDir(source, target) {
  return `ncp ${source} ${target}`;
}

function build(pathSource, pathTarget) {
  return `tsc -t es2017 --module CommonJS --outDir ${pathTarget} ${pathSource}`;
}

function runFast(path) {
  return `ts-node --transpile-only ${path}`;
}

function tslint(path) {
  return `tslint -c ./tslint.json ${path} --format stylish`;
}

function watch(what, cmd) {
  return `nodemon --watch ${what} ${cmd}`
}
