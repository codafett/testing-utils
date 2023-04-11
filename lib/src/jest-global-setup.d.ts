import { ConnectionSettings, DatabaseSettings } from './types';
export declare const jestGlobalSetUp: (databaseSettings: DatabaseSettings, connectionSettings?: ConnectionSettings) => () => Promise<void>;
