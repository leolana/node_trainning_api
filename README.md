# Node.js Alpe API &nbsp;

Alpe API  **Portal Financeiro** developed in **[Node.js][node]** with database 
**[Postgres][postgres]**.

<p align="center"><a href="https://www.postgresql.org"><img src="https://www.postgresql.org/media/img/about/press/elephant.png" height="24" align="top" /></a> 
<a href="https://www.docker.com"><img src="https://camo.githubusercontent.com/fa6d5c12609ed8a3ba1163b96f9e9979b8f59b0d/687474703a2f2f7765732e696f2f566663732f636f6e74656e74" height="24" align="top" /></a> 
<a href="https://nodejs.org/"><img src="https://nodejs.org/static/images/logos/nodejs-new-pantone-black.png" height="24" align="top" /></a> </p>

---

## About Project

More info about project: [Alpe - Project](./docs/PROJECT.md)

---

## Tech Stack

* [Docker][docker], [Node.js][node], [JavaScript][js], [Babel][babel], [Winston][winston] — core platform and dev tools
* [Restify][restify], [Session][session] — common HTTP-server features
* [PostgreSQL][pg], [Oracledb][oracledb] — Database access
* [Mocha][mocha] - Test

## ❯ Prerequisites

* [Node.Js][node] Version `v8x`
* [Docker][docker] Community Edition v17 ou higher
* [VS Code][code] editor, [ESLint][eslint] plug-ins.
* [Postgres][postgres] Database.


## ❯ Getting Started

* Verify node version `v10.15.0`.
* Clone and run  `npm i`

```bash
git clone https://github.com/ITLAB-BR/alpe-api.git alpe-api
cd alpe-api                  # Change to the project directory
npm i                        # install all dependencies
```
* Setup project
  * Env
    * Copy the `.env.example` file and rename it to `.env`. In this file you have add your configs informations.
  * Then setup your application environment
```bash
npm run setup
```

* Serve Api and watch
```bash
npm start serve             #serve api with typescript been transpiled in runtime and watches changes in ./src
```
or
```bash
npm start watch             #build the api to javascript and watches changes in ./src
```
> This starts a local server using `nodemon`, which will watch for any file changes and will restart the sever according to these changes.
> The server address will be displayed to you as `http://localhost:8081`.

## ❯ Scripts and Tasks

All script are defined in the `package-scripts.js` file, but the most important ones are listed here.

### Install

- Install all dependencies with `npm i`

### Linting

- Run code quality analysis using `npm start lint`. This runs tslint.
- There is also a vscode task for this called `lint`.

### Tests

- Run the unit tests using `npm start test` (There is also a vscode task for this called `test`).
- Run the integration tests using `npm start test.integration`.
- Run the e2e tests using `npm start test.e2e`.

### Seed

- Create new seed using `npm "start db.seed_generate <file-name-seed>"`.
- Run the seeds `npm start db.seed`.

### Migrations

- Create new migrations using `npm "start db.migrate_generate <file-name-migrate>"`.
- Run the migrations `npm start db.migrate`.

### Running in dev mode

- Run `npm start serve` to start nodemon with ts-node, to serve the app.
- The server address will be displayed to you as `http://localhost:8081`

### Building the project and run it

- Run `npm start build` to generated all JavaScript files from the TypeScript sources (There is also a vscode task for this called `build`).
- To start the builded app located in `dist` use `npm start`.

### ❯ Debugger in VSCode

To debug your code run `npm start build` or hit `cmd + b` to build your app.
Then, just set a breakpoint and hit `F5` in your Visual Studio Code.

[Manual das variáveis de ambiente](./docs/MANUAL_VARIAVEIS.md)

## ❯ Docker
Just run the command:
```bash
chmod +x ./start-dev.sh
./start-dev.sh
```

## ❯ DDD and Clean Architecture

The application follows the Uncle Bob "[Clean Architecture](https://8thlight.com/blog/uncle-bob/2012/08/13/the-clean-architecture.html)" principles and project structure :

## ❯ Directory Layout

```bash
.
├── /vscode/                            # VSCode tasks, launch configuration and some
├── /commands/                          # Commands specifics to be executed with nps
├── /dist/                              # Compiled source files will be placed here
├── /docs/                              # Docs of project
├── /postman/                           # API documentation (POSTMAN)
├── /scripts/                           # Database scripts  seed/migrations
├── /src/                               # Node.js application source files
│   ├── /constants/                     # Constants of app
│   |   ├── types.ts                    # types to dependency injection
│   ├── /domain/                        # Enterprise core business layer
│   |   ├── /entities/                  # Domain model objects such as Entities, Aggregates, Value Objects, Business Events, etc.
│   |   ├── /services/                  # Domain services
│   |   ├── /usecases/                  # Application business rules
│   ├── /infra/                         # Frameworks, drivers and tools such as Database, the Web Framework and etc
│   |   ├── /api/                       # Api config
│   |   |   ├── /logging/               # Api Logging
│   |   |   ├── /ControllerLoader.ts    # Loader of controllers and routes
│   |   |   ├── /router.ts              # Config router and middlewares
│   |   |   ├── /Server.ts              # Server abstraction
│   |   ├── /auth/                      # Auth config
│   |   ├── /console/                   # Console config
│   |   ├── /database/                  # Database driver config
│   |   |   ├── /migrations/            # Database migration scripts
│   |   |   ├── /models/                # Sequelize Models
│   |   |   ├── /seeds/                 # Seeds to create some data in the database
│   |   |   ├── /index.ts               # index to database
│   |   |   ├── /ModelsLoader.ts        # Loader of Sequelize Models
│   |   |   ├── /validator.ts           # validator db types
│   |   ├── /environment/               # environment abstraction
│   |   ├── /fileStorage/               # FileStorage config
│   |   ├── /internalApis/              # Internal Apis config
│   |   ├── /logging/                   # Logger of app config
│   |   ├── /mailer/                    # Mailer config
│   |   |   ├── /emails/                # Email templates
│   |   |   ├── /emailTemplates.ts      # Constantes to email tempaltes
│   |   ├── /siscof/                    # Siscof adapter config
│   ├── /interfaces/                    # Adapters and formatters for use cases and entities to external agency such as Db or Web
│   |   ├── /rest/                      # Rest adapter
│   |   |   ├── /controllers/           # API Controllers
│   |   |   ├── /errors/                # Custom HttpErrors like 404 NotFound
│   |   |   ├── /middlewares/           # Express Middlewares like authorization features
│   |   |   ├── Controller.ts           # Controller interface
│   ├── /types/                         # Custom type definitions and files that aren't on DefinitelyTyped
│   |   |   ├── express-request.d.ts    # Custom type definition to express
│   |   |   ├── json.d.ts               # Custom type definition to json extension
│   |   |   ├── sequelize-database.d.ts # Custom type definition to sequelize
│   ├── /Application.ts                 # Application services
│   ├── /config.ts                      # Global config app based in envs
│   ├── /container.ts                   # Dependecy Injection Container config with inversify
│   ├── /index.ts                       # bootstrap of app
├── /test                               # Tests
│   ├── /e2e/                           # End-2-End tests (like e2e)
│   ├── /integration/                   # Integration test with postgres
│   ├── /support/                       # Support to tests (like database, logging mocks)
│   ├── /unit/                          # Unit tests
├── .dockerignore                       # Defines Docker ignore folder, files and etc
├── .editorconfig                       # Editorconfig custom configrations
├── .env.example                        # Environment configurations
├── .gitignore                          # Defines git ignore folder, files and etc
├── .prettierignore                     # Defines prettier ignore folder, files and etc
├── .prettierrc                         # Prettier configuration
├── commitlint.config.js                # Commitlint config
├── docker-compose.yml                  # Defines Docker services, networks and volumes
├── docker-compose-dev.yml              # Defines Docker services, networks and volumes to development env
├── Dockerfile                          # Commands for building a Docker image for production
├── package-scripts.js                  # Package Scripts to app
├── package.json                        # List of project dependencies
├── start-dev.sh                        # Script to run  image app with docker
├── tsconfig.json                       # Ttpescript configuration to build
├── tslint.json                         # TSLint configuration
```

## ❯ Changelog

More info about releases you find in [Changelog](./docs/CHANGELOG.md)

## ❯ Related Projects

* [Front-End](https://github.com/ITLAB-BR/alpe-bko) —   Front-End repository (www)
* [Integration](https://github.com/ITLAB-BR/alpe-api-integracao) — Integration gateway
* [Documentation](https://github.com/ITLAB-BR/alpe) — Documentation / Backlog / Sprints
* [Deply (GMUD)](https://github.com/ITLAB-BR/alpe-api/docs/DEPLOY.md) — Deploy GMUD

---

## ❯ Contributors

Please read [CONTRIBUTORS.md](./docs/CONTRIBUTORS.md) for details on our code of conduct, and the process for submitting pull requests to us.

---

## ❯ Contributing

Please read [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

---

## ❯ Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags).

---
Made with ♥ by ITLAB (http://www.itlab.com.br)

[winston]: https://github.com/winstonjs/winston
[node]: https://nodejs.org
[js]: https://developer.mozilla.org/docs/Web/JavaScript
[babel]: http://babeljs.io/
[postgres]: https://www.postgresql.org/
[restify]: http://restify.com/
[pg]: https://www.postgresql.org/
[code]: https://code.visualstudio.com/
[oracledb]:https://github.com/oracle/node-oracledb
[eslint]:https://eslint.org
[docker]: https://www.docker.com/community-edition
[compose]: https://docs.docker.com/compose/
[mocha]:https://mochajs.org
[session]:https://github.com/expressjs/session
