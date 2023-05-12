# `@tiney/testing-utils`

<!-- TOC tocDepth:2..3 chapterDepth:2..6 -->

- [Introduction](#introduction)
  - [What's it for](#whats-it-for)
  - [What's it not for](#whats-it-not-for)
- [Usage](#usage)
- [Setting up db/api testing in a service](#setting-up-dbapi-testing-in-a-service)
  - [Folder](#folder)
  - [Setting up the scripts](#setting-up-the-scripts)
  - [Setting up docker-compose](#setting-up-docker-compose)
  - [Setting up Jest](#setting-up-jest)
  - [Mocks](#mocks)
  - [Setting up TS](#setting-up-ts)
  - [Setting up the CI/CD Pipeline](#setting-up-the-cicd-pipeline)
  - [Anatomy of a API/DB controller test file](#anatomy-of-a-apidb-controller-test-file)

<!-- /TOC -->

## Introduction

### What's it for
This packages is to enable the use of API/Db testing within services.

It was originally delivered in @tiney/infra but needs to live in it's own package so that we can update independently in other packages
when we update the references in this package (i.e. typeORM and Jest in particular)

The idea is that with these utils you can test services from the API call layer testing all the way to the database layer.

### What's it not for
It's not going to enable end-to-end testing of services. The idea is to mock out external calls and focus on testing that an end point accepts the correct input and returns the right output

## Usage

This package should be installed as a DEV dependency only

You should also install `ts-jest` and optionally `jest-expect-message`

```
npm i @tiney/testing-utils@latest ts-jest jest-expect-message --save-dev
```

You should also update `jest` to version `26.6.3`

## Setting up db/api testing in a service

Testing utils currently supports MySql and Postgres database testing.

It works by starting a docket container with the DB running and uses TypeORM transactions to make sure each test runs in isolation.

The docket container starts before the tests run and part of the jest global scripts then run migrations to set up the tables and the initial seeds.

It's also possible to run specific test seeds - although I've not actually tried that and right now they are global test seeds rather than pre test seeds.

Once the db is up and running there are some helper methods to set data up and read it back from the DB with having to use service repo's etc.

### Folder
It's recommended to create a `test` folder in the root project folder to hold all the project test assets

### Setting up the scripts
The docker container takes a few seconds to be up and running so we need to wait for the service to be ready before running any tests.

Copy the `.wait-for-it.sh` file from the root of this project to the `test` folder created in teh previous step.

Now you can add the following scripts to the `scripts` section of the projects `package.json` for running tests:

```json
    "test:command": "TZ=utc APP_ENV=local jest --group=-pact/provider --group=-pact/consumer --no-watchman --passWithNoTests",
    "test:db:down": "docker compose -f test/docker-compose.test.yml down",
    "test": "npm run test:command",
    "test:ci": "npm run test:command -- --ci --runInBand --coverage=true",
    "pretest": "npm run test:db:up",
    "posttest": "npm run test:db:down",
```

__`test:command`__ - is the base command for running test and has been extracted so it can be re-used in other scripts

__`test:db:down`__ - stops the docker container running the database

__`test`__ - standard command for running the projects tests

__`test:ci`__ - the script used by the ci server to run tests (to collect coverage etc)

__`pretest`__ - used with the `test` command to make sure that the db starts before the tests are run

__`posttest`__ - used with the `test` command to make sure the db server staops after the tests have finished - will also make sure the db is stopped if the tests fail or throw an exception

**There's one more command you need, but this one is db type specific:**

__`test:db:up`__ - start the docker container running the db. This is useful if you want to make sure the db has the correct schema applied and to see what seeds/migration etc have run.

For MySql add:
```json
    "test:db:up": "chmod +x test/.wait-for-it.sh && docker compose -f test/docker-compose.test.yml up -d && test/.wait-for-it.sh -t 0 127.0.0.1:3333 -- echo 'db is up'",
```

For Postgres add:
```json
    "test:db:up": "chmod +x test/.wait-for-it.sh && docker compose -f test/docker-compose.test.yml up -d && test/.wait-for-it.sh -t 0 127.0.0.1:555 -- echo 'db is up'",
```

#### Setting up the database instance

In order to get the tests to use the test database you need to update the sql connection file `src/datasources/sql/bootstrap/instance.ts`

In most cases the file will look like this:

```ts
import Container from 'typedi';
import {
  Connection,
  ConnectionOptions,
  createConnection,
  getConnection,
  useContainer,
} from 'typeorm';
import {
  initializeTransactionalContext,
  patchTypeORMRepositoryWithBaseRepository,
} from 'typeorm-transactional-cls-hooked';

import buildConfig from './build-config';

export async function sqlFactory() {
  initializeTransactionalContext();
  patchTypeORMRepositoryWithBaseRepository();
  useContainer(Container);

  let sql: Connection;

  try {
    sql = getConnection();
  } catch {
    const configs = await buildConfig();
    sql = await createConnection(
      // [0] - Default configuration
      configs[0] as ConnectionOptions,
    );
  }

  Container.set({
    type: Connection,
    value: sql,
  });
}
```

What we need to do is to allow a db config to be passed in, and when it is, to use that config instead of the default, so the updated file would look like this:

```ts
import Container from 'typedi';
import {
  Connection,
  ConnectionOptions,
  createConnection,
  getConnection,
  useContainer,
} from 'typeorm';
import {
  initializeTransactionalContext,
  patchTypeORMRepositoryWithBaseRepository,
} from 'typeorm-transactional-cls-hooked';

import buildConfig from './build-config';

export async function sqlFactory(config?: ConnectionOptions) {
  let connectionOptions = config;

  initializeTransactionalContext();
  patchTypeORMRepositoryWithBaseRepository();
  useContainer(Container);

  let sql: Connection;
  if (!connectionOptions) {
    const configs = await buildConfig();
    connectionOptions = configs[0] as ConnectionOptions;
  }

  try {
    sql = getConnection();
  } catch {
    sql = await createConnection(connectionOptions);
  }

  Container.set({
    type: Connection,
    value: sql,
  });
}
```

### Setting up docker-compose
Create a file called `docker-compose.test.yml` in the `test` folder of the project.

Copy the contents of either the `docker-compose.mysql.yml` or `docker-compose.postgres.yml` files from this project and adjust if/where necessary.

#### Ports
The docker-compose files use non-standard ports for testing locally. This is just to avoid conflicting with a standard installation of the db servers that might be running.

#### Env Settings
These compose files also make use of a file called `mysql-service-env` or `postgres-service-env` which should be created in the test folder. These files should contain any DB server settings required by the docker-compose files.

You can copy the contents of either `.env.mysql-service-env.skel` or `.env.postgres-service-env.skel` as required.

You need to update these files to replace the holder `**YOUR_DB_NAME_HERE**` with the actual name of your test database (which can be anything, you just need to be consistent as you'll use this name later setting up the jest scripts)

**__N.B. Postgres doesn't allow `-` character in database names!!__**

### Setting up Jest

#### Database Settings
Create a file in the `test` folder called `database-settings.ts`.

This file sets up all the TypeORM entities and migration details and is used at both global and individual test level which is why these settings are extracted to a common file.

Copy the following code and paste it into this file:
```ts
import { DatabaseSettings, DbType } from '@tiney/testing-utils';

import * as Entities from '../src/datasources/sql/entities';
import * as Seeds from '../src/datasources/sql/seeds';

const databaseSettings: DatabaseSettings = {
  dbType: // DbType.MySql or DbType.Postgres,
  databaseName: '' // The name of your database
  entities: Object.values(Entities),
  seeds: Object.values(Seeds),
  migrationsDir: '/datasources/sql/seeds',
};

export default databaseSettings;
```

__N.B.__ the value of the `databaseName` setting must be the same value entered in the  `mysql-service-env` or `postgres-service-env` file created earlier.

The location of entities seeds and migrationsDir are usually the same, but you may need to update these if they don't match your project.

#### sqlFactory
We also need to update the standard `sqlFactory` code in our service. This should be located in `src/datasources/sql/bootstrap/instance.ts` and will most likely look like this:

```ts
import Container from 'typedi';
import {
  Connection,
  ConnectionOptions,
  createConnection,
  getConnection,
  useContainer,
} from 'typeorm';
import {
  initializeTransactionalContext,
  patchTypeORMRepositoryWithBaseRepository,
} from 'typeorm-transactional-cls-hooked';

import buildConfig from './build-config';

export async function sqlFactory() {
  initializeTransactionalContext();
  patchTypeORMRepositoryWithBaseRepository();
  useContainer(Container);

  let sql: Connection;

  try {
    sql = getConnection();
  } catch {
    const configs = await buildConfig();
    sql = await createConnection(
      // [0] - Default configuration
      // [1] - Seeds
      // [2] - Tasks
      configs[0] as ConnectionOptions,
    );
  }

  Container.set({
    type: Connection,
    value: sql,
  });
}
```

It needs updating to accept a config object and, if received, use it, or else use the default project config.

```ts
import Container from 'typedi';
import {
  Connection,
  ConnectionOptions,
  createConnection,
  getConnection,
  useContainer,
} from 'typeorm';
import {
  initializeTransactionalContext,
  patchTypeORMRepositoryWithBaseRepository,
} from 'typeorm-transactional-cls-hooked';

import buildConfig from './build-config';

export async function sqlFactory(config?: ConnectionOptions) {
  let connectionOptions = config;

  initializeTransactionalContext();
  patchTypeORMRepositoryWithBaseRepository();
  useContainer(Container);

  let sql: Connection;
  if (!connectionOptions) {
    const configs = await buildConfig();
    connectionOptions = configs[0] as ConnectionOptions;
  }

  try {
    sql = getConnection();
  } catch {
    sql = await createConnection(connectionOptions);
  }

  Container.set({
    type: Connection,
    value: sql,
  });
}
```

#### Global Settings
Create a file in the `test` folder called `jest-global-setup.ts`.

This file runs ONCE, BEFORE jest runs any tests and is used to create the DB and run migrations.

Copy the following code and paste it into this file:
```ts
/* eslint-disable import/no-extraneous-dependencies */
import 'tsconfig-paths/register';

import { jestGlobalSetUp } from '@tiney/testing-utils';

import databaseSettings from './database-settings';

export default jestGlobalSetUp(databaseSettings);

```

In `jest.config` you need to set up jest to use the config file created above and to map module names.

First add the following required imports at the top of the file:
```ts
const { pathsToModuleNameMapper } = require('ts-jest/utils');
const { compilerOptions } = require('./tsconfig');
```

Then add the following to the exported code:
```ts
modules.exports = {
  //...usual info, name, presets etc
  globalSetup: './test/jest-global-setup.ts',
  // Module directories might already exists, if so just make sure 'test' is added
  moduleDirectories: ['types', 'node_modules', 'src', 'test'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
    setupFilesAfterEnv: [
      // Only required if you are using jest-expect-message and have installed it
    'jest-expect-message',
  ],
  //...rest of the settings
}
```

#### DB Set up file
Create another file in the `test` folder called `setup-db-test-fixtures.ts`

This file is responsible for setting up the db before and after each test.

Copy the following code and paste it into this file:
```ts
import { setUpTestFixtures } from '@tiney/testing-utils';

import { sqlFactory } from '../src/datasources/sql';
import databaseSettings from './database-settings';

setUpTestFixtures(sqlFactory, databaseSettings);

```

**Usage**

You need to import this file in **EVERY** test file that runs API.DB tests as follows:
```ts
import 'test/setup-db-test-fixtures';
```

#### Mocks
Create a folder under the `test` folder called `mocks`. 

##### Mocking Env Settings
This step is only required if you need to mock env variables returned from calls to `getEnvs` in `@tiney/infrastructure`.

Create a file in the `mocks` folder called `mock-get-envs.ts` and add the following code:

```ts
import { getEnvs } from '@tiney/infrastructure';
import { ServiceConfiguration } from 'services/configuration';
import Container from 'typedi';

import testEnvSettings from './test-env-settings';

jest.mock('@tiney/infrastructure', () => {
  const actual = jest.requireActual('@tiney/infrastructure') as {};
  return {
    ...actual,
    getEnvs: jest
      .fn()
      .mockImplementation((envName) => testEnvSettings[envName]),
  };
});

const serviceConfig = Container.get(ServiceConfiguration);
(async () => serviceConfig.init())();

```

__*N.B. The call to service config is only required if you are mocking out environment variables that hold urls of other services.*__

**Usage**

You need to import this file in **EVERY** test file that runs API.DB and requires env settings to be mocked:
```ts
import 'test/mocks/mock-get-envs.ts';
```

##### __Mocking on specific tests only: generateSlug__

In billing there was a requirement to know the output of the `generateSlug` method and so it was mocked out. However, if we mocked this value at the global level then other tests failed (because every call to `generateSlug` returned the same value)

In order to get round this we first mock out `generateSlug` but we default it to use the actual method on `@tiney/infrastructure`

```ts
import { ServiceConfiguration } from 'services/configuration';
import Container from 'typedi';

import testEnvSettings from './test-env-settings';

jest.mock('@tiney/infrastructure', () => {
  const actual = jest.requireActual('@tiney/infrastructure') as {};
  return {
    ...actual,
    generateSlug: jest
      .fn()
      // @ts-expect-error: Typescript is too dumb to know this has been mocked :P
      .mockImplementation(() => actual.generateSlug()),
    getEnvs: jest
      .fn()
      .mockImplementation((envName) => testEnvSettings[envName]),
  };
});

const serviceConfig = Container.get(ServiceConfiguration);
(async () => serviceConfig.init())();

```

Then in the test file we need a specific implementation of the function we would need to first import the original library

``` ts
import { generateSlug } from '@tiney/infrastructure';
```

and then we could change the implementation as follows:

```ts
    beforeEach(() => {
      // @ts-expect-error: Typescript is too dumb to know this has been mocked :P
      generateSlug.mockReturnValue('5582ad38976f8353');
    });
```

__*N.B. We have to tell typescript to expect an error as otherwise the code doesn't compile because it doesn't know that `generateSlug` has been mocked*__

There are also occasions when we need to override the env settings on a per test basis, for instance when testing a feature flag.

Again this can be done relatively simply by adding a couple of helper functions to your `setup-get-envs-mock.ts` file as follows:

```ts
export function mockGetEnvs(envs: Record<string, string>) {
  // @ts-expect-error: Typescript is too dumb to know this has been mocked :P
  getEnvs.mockImplementation((envName) => {
    return {
      ...testEnvSettings,
      ...envs,
    }[envName];
  });
}

export function mockGetEnvsReset() {
  // @ts-expect-error: Typescript is too dumb to know this has been mocked :P
  getEnvs.mockImplementation((envName) => {
    return {
      ...testEnvSettings,
    }[envName];
  });
}
```

These can then be used in your test files as follows:
```ts
  beforeEach(() => {
    mockGetEnvs({
      APP_FEATURE_FLAG_RATES_MOVED_TO_CARE_SCHEDULE_ENABLED:
        'false',
    });
  });
  afterEach(() => {
    mockGetEnvsReset();
  });
```

##### Other useful mocks
A couple of other mocks I found useful (and have added support for) are creating agent notes and publishing topics. Technically these just require mocking `async` calls so I added support for that in `mock-promise.ts`

This method simply wraps your calls with a simple `Promise.resolve('done')` by default but the `mockAsyncCall` also accepts another parameter for the mock implementation method used.

###### Mocking createAutoAgentNote

Create a file in `mocks` called `mock-create-agent-note.ts` and use the following code:

```ts
import { agentNoteService } from '@tiney/infrastructure';
import { mockAsyncCall } from '@tiney/testing-utils';

export function mockCreateAgentNote() {
  return mockAsyncCall(agentNoteService, 'createAutoAgentNote');
}
```

###### Mocking publishTopic

Create a file in `mocks` called `mock-publish-topic.ts` and use the following code:


```ts
import { publishTopic } from '@tiney/infrastructure';
import { mockAsyncCall } from '@tiney/testing-utils';

export function mockPublishTopic() {
  return mockAsyncCall(pubsubService, 'publishTopic');
}
```

#### Database Utils
This package provides some quick and easy methods to populating and reading data in your database.

If you need a specific repository then you can use the following import:
```ts
import { getRepository } from '@tiney/testing-utils';
```

and then call:
```ts
  const userRepo = getRepository(User)
```

where `User` is your TypeORM class definition.

Other methods are:
```ts
export function createEntity<ET>(
  entityTarget: EntityTarget<ET>,
  entity?: DeepPartial<ET>,
): ET

function getEntityId(entity: unknown)

function getEntitySlug(entity: unknown)

export async function getEntity<ET>: Promise<ET | undefined>

export async function saveEntity<ET>: Promise<ET>

export async function createAndSaveEntity<ET>: Promise<ET> 

export async function findEntity<ET>: Promise<ET[]>

```

#### Mocking API calls
In order to test the full call of an api (especially tiney services) we will need to mock out any calls to external services, the most obvious ones being calls to authentication

To do this there are some helper utils that essentially wrap `nock` to provide a quick set-up.

You're free to also include `nock` in individual services if you need anything more elaborate but most of the methods in here accept additional parameters that are passed on to `nock`, or return `nock` specific objects that you can manipulate within the service test files

To mock external service calls you need to import the `mockHttpCalls` method and `MockHttpCallType` type from `@tiney/testing-utils`.

```ts
import {
  mockHttpCalls,
  MockHttpCallType,
} from '@tiney/testing-utils';
```

__Example: Per test mocking__

This is an example of a service mocking calls to `tiney-core-service` for authentication and to get an enrolment.

This is how you'd write the mock if you were mocking for a single test (i.e. within a `test` ro `it` block)
```ts
    mockHttpCalls(testEnvSettings.APP_SECRET_CORE_SERVICE_HOST, [
      {
        url: '/internal/auth/me',
        type: MockHttpCallType.GET,
        responseData: {
          id: 1,
          roles: ['site-admin'],
          user: { isAdmin: { slug: userSlug } },
        },
      },
      {
        url: `/internal/enrollment/${enrollmentSlug}`,
        type: MockHttpCallType.GET,
        responseData: {
          slug: enrollmentSlug,
          provider: {
            slug: providerSlug,
          },
        },
      },
    ]);
```

__Example: Per describe mocking__

This is the same example but this time we might want the call to return the same result for all our tests within a describe block.

For this we'd include the following with a `beforeEach` or `beforeAll` method
```ts
    mockHttpCalls(testEnvSettings.APP_SECRET_CORE_SERVICE_HOST, [
      {
        url: '/internal/auth/me',
        type: MockHttpCallType.GET,
        responseData: {
          id: 1,
          roles: ['site-admin'],
          user: { isAdmin: { slug: userSlug } },
        },
      },
      {
        url: `/internal/enrollment/${enrollmentSlug}`,
        type: MockHttpCallType.GET,
        responseData: {
          slug: enrollmentSlug,
          provider: {
            slug: providerSlug,
          },
        },
      },
    ],
    {
      persist: true,
    });
```

The difference here is the additional parameters object passed as 
```ts
  {
    persist: true,
  }
```

this tells `nock` to keep returning the same result for each call.

### Setting up TS
Most of our services use modules for package look up so in order to reference test modules it's easiest to add the following to the `"paths"` section of the projects `tsconfig.json` file:

```json
      "test/*": ["test/*"]
```


### Setting up the CI/CD Pipeline
In order for the tests to run on the CI pipeline you have to make one change to the `config.yml` file found in the `.circelci` folder in the root folder of `tiney-services`

Find the job configuration for your service which will look something like this:

```yml
  tiney-billing-service:
    when: << pipeline.parameters.tiney-billing-service >>
    jobs:
      - test-service:
          <<: *run-on-branch-or-deploy-tag
          package: << pipeline.parameters.tiney-billing-service >>

      - deploy-service:
          <<: *deploy-stage-with-requires
          context:
            - pubsub-topics
            - services-stage
            - services-billing-stage
          package: << pipeline.parameters.tiney-billing-service >>
          migration-url: https://europe-west2-tin-pro-service-staging.cloudfunctions.net/tiney-billing-service-dev-migrations/migrate
          seed-url: https://europe-west2-tin-pro-service-staging.cloudfunctions.net/tiney-billing-service-dev-migrations/seed

      - deploy-service:
          <<: *deploy-prod-with-requires
          context:
            - pubsub-topics
            - services-prod
            - services-billing-prod
          package: << pipeline.parameters.tiney-billing-service >>
          migration-url: https://europe-west2-tin-pro-service-prod.cloudfunctions.net/tiney-billing-service-prod-migrations/migrate
          seed-url: https://europe-west2-tin-pro-service-prod.cloudfunctions.net/tiney-billing-service-prod-migrations/seed
```

and change `test-service` for either `test-service-with-mysql` or `test-service-with-postgres` as required.

You also need to pass a new parameter `sql-database` to the job containing the name of youre test database - this needs to be the same value you set up in `test-env-settings.ts`

You also need to change the `deploy-service` tasks to use `deploy-stage-with-requires-postgres`

After you've finished your job configuration would look like this:
```yml
  tiney-billing-service:
    when: << pipeline.parameters.tiney-billing-service >>
    jobs:
      - test-service-with-mysql:
          <<: *run-on-branch-or-deploy-tag
          package: << pipeline.parameters.tiney-billing-service >>
          sql-database: billing-service-test-db

      - deploy-service:
          <<: *deploy-stage-with-requires-mysql
          context:
            - pubsub-topics
            - services-stage
            - services-billing-stage
          package: << pipeline.parameters.tiney-billing-service >>
          migration-url: https://europe-west2-tin-pro-service-staging.cloudfunctions.net/tiney-billing-service-dev-migrations/migrate
          seed-url: https://europe-west2-tin-pro-service-staging.cloudfunctions.net/tiney-billing-service-dev-migrations/seed

      - deploy-service:
          <<: *deploy-prod-with-requires-mysql
          context:
            - pubsub-topics
            - services-prod
            - services-billing-prod
          package: << pipeline.parameters.tiney-billing-service >>
          migration-url: https://europe-west2-tin-pro-service-prod.cloudfunctions.net/tiney-billing-service-prod-migrations/migrate
          seed-url: https://europe-west2-tin-pro-service-prod.cloudfunctions.net/tiney-billing-service-prod-migrations/seed
```
### Anatomy of a API/DB controller test file
Putting all the parts together this is what's require to set up a test file to test an API end point.

Generally speaking each end point is called a `controller` in tiney-services and had a folder relating to the route, this folder contains an `index.ts` file that defines the route end points.

To set up testing we create a `index.test.ts` file in the same location.

The basic test file would contain the following:

```ts
import {
  generateSlug,
  web,
} from '@tiney/infrastructure';
import {
  createServerApp,
  findEntity,
  getEntity,
  mockHttpCalls,
  MockHttpCallType,
} from '@tiney/testing-utils';

import router from '.';

describe('/provider', () => {
  let server;
  let agent;
  let createAgentNoteNMock;
  beforeAll(async () => {
    ({ server, agent } = await createServerApp(web, [
      {
        path: '/provider',
        router,
      },
    ]));
  });
  beforeEach(() => {
    createAgentNoteMock = mockCreateAgentNote();
  });
  afterAll(async (done) => {
    return server && server.close(done);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /provider', () => {
    it('should return 200 and all the providers in the DB', async () => {
      const userSlug = generateSlug();

      // ARRANGE
      
      // Set up any DB objects you want to test the end point returns
      const provider1 = await createAndSaveEntity(Provider, {
        slug: generateSlug(),
        status: ProviderStatus.FULL,
        regulator: Regulator.TINEY_ENGLAND,
        name: 'Provider 1',
        updatedDate: new Date(),
      });

      // Mock out auth call
      mockHttpCalls(testEnvSettings.APP_SECRET_CORE_SERVICE_HOST, [
        {
          url: '/internal/auth/me',
          type: MockHttpCallType.GET,
          responseData: {
            id: 1,
            roles: ['site-admin'],
            user: { isAdmin: { slug: userSlug } },
          },
        },
      ]);

      // ACT

      // Call the end points
      const res = await agent
        .get(`/provider`)
        .set('Authorization', 'auth site-admin');
      expect(res.statusCode).toEqual(200);

      const {
        body: { data: providers },
      } = res;


      // ASSERT

      expect(providers).toHaveLength(1);

      // Use the helper method to check the arrays match
      expectEntityArraysToMatch(providers, [
        provider1,
      ]);
    })
  })
})

```
