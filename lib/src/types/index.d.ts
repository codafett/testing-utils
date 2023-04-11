export declare enum DbType {
    MySql = "mysql",
    Postgres = "postgres"
}
export interface ConnectionSettings {
    typeName: string;
    host: string;
    localTestPort: number;
    ciTestPort: number;
    userName: string;
    password: string;
}
export interface DatabaseSettings {
    dbType: DbType;
    databaseName: string;
    entities: unknown;
    migrationsDir: string;
    subscribers?: (string | Function)[] | undefined;
    seeds?: (string | Function)[] | undefined;
    tasks?: (string | Function)[] | undefined;
    testSeeds?: (string | Function)[] | undefined;
    testMigrationsDir?: string;
}
