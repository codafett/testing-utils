/* eslint-disable no-underscore-dangle */
import { ConnectionOptions, EntitySchema } from 'typeorm';

import {
  ConnectionSettings,
  DatabaseSettings,
  DbType,
} from './types';

export const ConnectionSettingsByType: Record<
  DbType,
  ConnectionSettings
> = {
  [DbType.MySql]: {
    typeName: 'mysql',
    host: '127.0.0.1',
    localTestPort: 3333,
    ciTestPort: 3306,
    userName: 'mysql',
    password: 'tiney',
  },
  [DbType.Postgres]: {
    typeName: 'postgres',
    host: '127.0.0.1',
    localTestPort: 5555,
    ciTestPort: 5432,
    userName: 'postgres',
    password: 'tiney',
  },
};

export default class DbConfigSettings {
  private _dbType: DbType;

  public get dbType(): DbType {
    return this._dbType;
  }

  private _testDbDefaultConfig: ConnectionOptions;

  public get testDbDefaultConfig(): ConnectionOptions {
    return this._testDbDefaultConfig;
  }

  private _testDbInitConfig: ConnectionOptions;

  public get testDbInitConfig() {
    return this._testDbInitConfig;
  }

  private _testDbSeedConfig: ConnectionOptions | undefined;

  public get testDbSeedConfig() {
    return this._testDbSeedConfig;
  }

  private _testDbTaskConfig: ConnectionOptions;

  public get testDbTaskConfig() {
    return this._testDbTaskConfig;
  }

  constructor(
    databaseSettings: DatabaseSettings,
    connectionSettingOverrides?: Partial<ConnectionSettings>,
  ) {
    this._dbType = databaseSettings.dbType;

    const dsTypeConnectionSettings =
      ConnectionSettingsByType[databaseSettings.dbType];
    if (!dsTypeConnectionSettings) {
      throw new Error(
        `Could not locate a config for type: ${databaseSettings.dbType}`,
      );
    }

    const settings = {
      ...dsTypeConnectionSettings,
      ...connectionSettingOverrides,
    };

    const dbPort: number =
      process.env.CI === 'true' && process.env.CIRCLECI === 'true'
        ? settings.ciTestPort
        : settings.localTestPort;

    this._testDbDefaultConfig = {
      type: settings.typeName,
      port: dbPort,
      logging: process.env.TEST_DB_LOGGING || false,
      host: settings.host,
      username: settings.userName,
      password: settings.password,
      database: databaseSettings.databaseName,
      entities: databaseSettings.entities as
        | (string | Function | EntitySchema<unknown>)[]
        | undefined,
      subscribers: databaseSettings?.subscribers,
    } as ConnectionOptions;

    this._testDbInitConfig = {
      ...this.testDbDefaultConfig,
      synchronize: true,
      dropSchema: true,
      migrationsTableName: 'seeds',
      migrations: databaseSettings?.seeds,
      cli: {
        migrationsDir: databaseSettings?.migrationsDir,
      },
    } as ConnectionOptions;

    this._testDbTaskConfig = {
      ...this.testDbDefaultConfig,
      migrationsTableName: 'tasks',
      migrations: databaseSettings?.tasks,
      cli: {
        migrationsDir: databaseSettings?.migrationsDir,
      },
    } as ConnectionOptions;

    if (
      !!databaseSettings?.testSeeds !==
      !!databaseSettings?.testMigrationsDir
    ) {
      throw new Error(
        'You must provide both testSeeds AND testMigrationsDir to run test seed migration scripts',
      );
    }
    this._testDbSeedConfig =
      databaseSettings?.testSeeds &&
      databaseSettings?.testMigrationsDir
        ? ({
            ...this.testDbDefaultConfig,
            migrationsTableName: 'seeds',
            migrations: databaseSettings.testSeeds,
            cli: {
              migrationsDir: databaseSettings.testMigrationsDir,
            },
          } as ConnectionOptions)
        : undefined;
  }
}
