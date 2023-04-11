import { ConnectionOptions } from 'typeorm';
import { ConnectionSettings, DatabaseSettings, DbType } from './types';
export declare const ConnectionSettingsByType: Record<DbType, ConnectionSettings>;
export default class DbConfigSettings {
    private _dbType;
    get dbType(): DbType;
    private _testDbDefaultConfig;
    get testDbDefaultConfig(): ConnectionOptions;
    private _testDbInitConfig;
    get testDbInitConfig(): ConnectionOptions;
    private _testDbSeedConfig;
    get testDbSeedConfig(): ConnectionOptions | undefined;
    private _testDbTaskConfig;
    get testDbTaskConfig(): ConnectionOptions;
    constructor(databaseSettings: DatabaseSettings, connectionSettingOverrides?: Partial<ConnectionSettings>);
}
