"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionSettingsByType = void 0;
const types_1 = require("./types");
exports.ConnectionSettingsByType = {
    [types_1.DbType.MySql]: {
        typeName: 'mysql',
        host: '127.0.0.1',
        localTestPort: 3333,
        ciTestPort: 3306,
        userName: 'mysql',
        password: 'tiney',
    },
    [types_1.DbType.Postgres]: {
        typeName: 'postgres',
        host: '127.0.0.1',
        localTestPort: 5555,
        ciTestPort: 5432,
        userName: 'postgres',
        password: 'tiney',
    },
};
class DbConfigSettings {
    constructor(databaseSettings, connectionSettingOverrides) {
        this._dbType = databaseSettings.dbType;
        const dsTypeConnectionSettings = exports.ConnectionSettingsByType[databaseSettings.dbType];
        if (!dsTypeConnectionSettings) {
            throw new Error(`Could not locate a config for type: ${databaseSettings.dbType}`);
        }
        const settings = {
            ...dsTypeConnectionSettings,
            ...connectionSettingOverrides,
        };
        const dbPort = process.env.CI === 'true' && process.env.CIRCLECI === 'true'
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
            entities: databaseSettings.entities,
            subscribers: databaseSettings?.subscribers,
        };
        this._testDbInitConfig = {
            ...this.testDbDefaultConfig,
            synchronize: true,
            dropSchema: true,
            migrationsTableName: 'seeds',
            migrations: databaseSettings?.seeds,
            cli: {
                migrationsDir: databaseSettings?.migrationsDir,
            },
        };
        this._testDbTaskConfig = {
            ...this.testDbDefaultConfig,
            migrationsTableName: 'tasks',
            migrations: databaseSettings?.tasks,
            cli: {
                migrationsDir: databaseSettings?.migrationsDir,
            },
        };
        if (!!databaseSettings?.testSeeds !==
            !!databaseSettings?.testMigrationsDir) {
            throw new Error('You must provide both testSeeds AND testMigrationsDir to run test seed migration scripts');
        }
        this._testDbSeedConfig =
            databaseSettings?.testSeeds &&
                databaseSettings?.testMigrationsDir
                ? {
                    ...this.testDbDefaultConfig,
                    migrationsTableName: 'seeds',
                    migrations: databaseSettings.testSeeds,
                    cli: {
                        migrationsDir: databaseSettings.testMigrationsDir,
                    },
                }
                : undefined;
    }
    get dbType() {
        return this._dbType;
    }
    get testDbDefaultConfig() {
        return this._testDbDefaultConfig;
    }
    get testDbInitConfig() {
        return this._testDbInitConfig;
    }
    get testDbSeedConfig() {
        return this._testDbSeedConfig;
    }
    get testDbTaskConfig() {
        return this._testDbTaskConfig;
    }
}
exports.default = DbConfigSettings;
//# sourceMappingURL=db-config-settings.js.map