import { DeepPartial, EntityTarget, FindManyOptions, FindOneOptions, SaveOptions } from 'typeorm';
export interface FindEntityOptions<ET> {
    findOneOptions?: FindOneOptions<ET>;
    findManyOptions?: FindManyOptions<ET>;
}
export interface SaveEntityOptions<ET> extends FindEntityOptions<ET> {
    saveOptions?: SaveOptions;
}
export declare function getRepository<ET>(entityTarget: EntityTarget<ET>): import("typeorm").Repository<ET>;
export declare function createEntity<ET>(entityTarget: EntityTarget<ET>, entity?: DeepPartial<ET>): ET;
export declare function getEntity<ET>(entityTarget: EntityTarget<ET>, id: string | number | Date, options?: FindOneOptions<ET>): Promise<ET | undefined>;
export declare function saveEntity<ET>(entityTarget: EntityTarget<ET>, entity?: ET, getId?: (e: ET) => string | number | Date, options?: SaveEntityOptions<ET>): Promise<ET>;
export declare function createAndSaveEntity<ET>(entityTarget: EntityTarget<ET>, entity: DeepPartial<ET>, getId?: (e: ET) => string | number | Date, options?: SaveEntityOptions<ET>): Promise<ET>;
export declare function findEntity<ET>(entityTarget: EntityTarget<ET>, option?: FindManyOptions<ET>): Promise<ET[]>;
export declare function convertDbEntityToResponseEntity(entity: unknown): any;
export declare function expectEntitiesToMatch(responseEntity: any, dbEntity: any): void;
export declare function convertDbEntitiesToResponseEntities(entities: unknown[]): any[];
export declare function expectEntityArraysToMatch(responseEntities: any, dbEntities: any): void;
