"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jestGlobalSetUp = void 0;
const typeorm_1 = require("typeorm");
const db_config_settings_1 = __importDefault(require("./db-config-settings"));
const types_1 = require("./types");
async function createDatabaseIfNotExistsPostgres(dbConfigSettings) {
    const connection = await (0, typeorm_1.createConnection)({
        ...dbConfigSettings.testDbDefaultConfig,
        database: 'postgres',
    });
    const manager = (0, typeorm_1.getManager)();
    const result = await manager.query(`SELECT 1 FROM pg_database WHERE datname = '${dbConfigSettings.testDbDefaultConfig.database}'`);
    if (result.length !== 0) {
        await manager.query(`DROP DATABASE ${dbConfigSettings.testDbDefaultConfig.database}`);
    }
    await manager.query(`CREATE DATABASE ${dbConfigSettings.testDbDefaultConfig.database}`);
    await connection.close();
}
async function createDatabaseIfNotExistsMysql(dbConfigSettings) {
    const connection = await (0, typeorm_1.createConnection)(dbConfigSettings.testDbDefaultConfig);
    const manager = (0, typeorm_1.getManager)();
    const result = await manager.query(`SELECT SCHEMA_NAME
    FROM INFORMATION_SCHEMA.SCHEMATA
   WHERE SCHEMA_NAME = '${dbConfigSettings.testDbDefaultConfig.database}'`);
    if (result.length !== 0) {
        await manager.query(`DROP DATABASE IF EXISTS \`${dbConfigSettings.testDbDefaultConfig.database}\``);
    }
    await manager.query(`CREATE DATABASE \`${dbConfigSettings.testDbDefaultConfig.database}\``);
    await connection.close();
}
async function connectToDbAndRunMigrations(config) {
    const t0 = Date.now();
    const connection = await (0, typeorm_1.createConnection)(config);
    const migrationsType = config.migrationsTableName;
    const connectTime = Date.now();
    await connection.runMigrations();
    const migrationTime = Date.now();
    // eslint-disable-next-line no-console
    console.info(` 👩‍🔬 Connected in ${connectTime - t0}ms - Executed ${migrationsType} migrations in ${migrationTime - connectTime}ms.`);
    await connection.close();
}
/*
 * This file is executed by Jest before running any tests.
 * We drop the database and re-create it from migrations every time.
 */
const jestGlobalSetUp = (databaseSettings, connectionSettings) => async () => {
    const dbConfigSettings = new db_config_settings_1.default(databaseSettings, connectionSettings);
    // Make sure the DB exists
    if (databaseSettings.dbType === types_1.DbType.MySql) {
        await createDatabaseIfNotExistsMysql(dbConfigSettings);
    }
    else if (databaseSettings.dbType === types_1.DbType.Postgres) {
        await createDatabaseIfNotExistsPostgres(dbConfigSettings);
    }
    else {
        throw new Error(`DbType not known`);
    }
    // Connect and run seeds
    await connectToDbAndRunMigrations(dbConfigSettings.testDbInitConfig);
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
exports.jestGlobalSetUp = jestGlobalSetUp;
//# sourceMappingURL=jest-global-setup.js.map