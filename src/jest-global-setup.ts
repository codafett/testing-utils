import { createConnection, getManager } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

import DbConfigSettings from './db-config-settings';
import {
  ConnectionSettings,
  DatabaseSettings,
  DbType,
} from './types';

async function createDatabaseIfNotExistsPostgres(
  dbConfigSettings: DbConfigSettings,
) {
  const connection = await createConnection({
    ...dbConfigSettings.testDbDefaultConfig,
    database: 'postgres',
  } as PostgresConnectionOptions);

  const manager = getManager();
  const result = await manager.query(
    `SELECT 1 FROM pg_database WHERE datname = '${dbConfigSettings.testDbDefaultConfig.database}'`,
  );

  if (result.length !== 0) {
    await manager.query(
      `DROP DATABASE ${dbConfigSettings.testDbDefaultConfig.database}`,
    );
  }
  await manager.query(
    `CREATE DATABASE ${dbConfigSettings.testDbDefaultConfig.database}`,
  );

  await connection.close();
}

async function createDatabaseIfNotExistsMysql(
  dbConfigSettings: DbConfigSettings,
) {
  const connection = await createConnection(
    dbConfigSettings.testDbDefaultConfig,
  );

  const manager = getManager();
  const result = await manager.query(
    `SELECT SCHEMA_NAME
    FROM INFORMATION_SCHEMA.SCHEMATA
   WHERE SCHEMA_NAME = '${dbConfigSettings.testDbDefaultConfig.database}'`,
  );

  if (result.length !== 0) {
    await manager.query(
      `DROP DATABASE IF EXISTS \`${dbConfigSettings.testDbDefaultConfig.database}\``,
    );
  }
  await manager.query(
    `CREATE DATABASE \`${dbConfigSettings.testDbDefaultConfig.database}\``,
  );

  await connection.close();
}

async function connectToDbAndRunMigrations(config) {
  const t0 = Date.now();
  const connection = await createConnection(config);
  const migrationsType = config.migrationsTableName;
  const connectTime = Date.now();
  await connection.runMigrations();
  const migrationTime = Date.now();
  // eslint-disable-next-line no-console
  console.info(
    ` 👩‍🔬 Connected in ${
      connectTime - t0
    }ms - Executed ${migrationsType} migrations in ${
      migrationTime - connectTime
    }ms.`,
  );
  await connection.close();
}
/*
 * This file is executed by Jest before running any tests.
 * We drop the database and re-create it from migrations every time.
 */
export const jestGlobalSetUp = (
  databaseSettings: DatabaseSettings,
  connectionSettings?: ConnectionSettings,
) => async () => {
  const dbConfigSettings = new DbConfigSettings(
    databaseSettings,
    connectionSettings,
  );
  // Make sure the DB exists
  if (databaseSettings.dbType === DbType.MySql) {
    await createDatabaseIfNotExistsMysql(dbConfigSettings);
  } else if (databaseSettings.dbType === DbType.Postgres) {
    await createDatabaseIfNotExistsPostgres(dbConfigSettings);
  } else {
    throw new Error(`DbType not known`);
  }

  // Connect and run seeds
  await connectToDbAndRunMigrations(
    dbConfigSettings.testDbInitConfig,
  );

  const { testDbSeedConfig, testDbTaskConfig } = dbConfigSettings;
  // Connect and run test tasks if required
  if (testDbTaskConfig) {
    await connectToDbAndRunMigrations(testDbTaskConfig);
  }

  // Connect and run test seeds if required
  if (testDbSeedConfig) {
    await connectToDbAndRunMigrations(testDbSeedConfig);
  }
};
