"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expectEntityArraysToMatch = exports.convertDbEntitiesToResponseEntities = exports.expectEntitiesToMatch = exports.convertDbEntityToResponseEntity = exports.findEntity = exports.createAndSaveEntity = exports.saveEntity = exports.getEntity = exports.createEntity = exports.getRepository = void 0;
const typeorm_1 = require("typeorm");
function getRepository(entityTarget) {
    return (0, typeorm_1.getConnection)().getRepository(entityTarget);
}
exports.getRepository = getRepository;
function createEntity(entityTarget, entity) {
    const repo = getRepository(entityTarget);
    return entity ? repo.create(entity) : repo.create();
}
exports.createEntity = createEntity;
function getEntityId(entity) {
    let entityId;
    if (Object.prototype.hasOwnProperty.call(entity, 'id')) {
        entityId = entity.id;
    }
    return entityId;
}
function getEntitySlug(entity) {
    let entityId;
    if (Object.prototype.hasOwnProperty.call(entity, 'slug')) {
        entityId = entity.slug;
    }
    return entityId;
}
async function getEntity(entityTarget, id, options) {
    const repo = getRepository(entityTarget);
    return repo.findOne(id, options);
}
exports.getEntity = getEntity;
async function saveEntity(entityTarget, entity, getId, options) {
    const repo = getRepository(entityTarget);
    let dbEntity;
    dbEntity = await repo.save(entity, options?.saveOptions);
    const dbEntityId = getId?.(dbEntity) || getEntityId(dbEntity);
    if (dbEntityId) {
        dbEntity =
            (await getEntity(entityTarget, dbEntityId, options?.findOneOptions)) || dbEntity;
    }
    else {
        const entitySlug = getEntitySlug(dbEntity);
        if (entitySlug) {
            [dbEntity] = (await repo.find({
                ...options?.findManyOptions,
                where: { slug: entitySlug },
            })) || [dbEntity];
        }
    }
    return dbEntity;
}
exports.saveEntity = saveEntity;
async function createAndSaveEntity(entityTarget, entity, getId, options) {
    const dbEntity = createEntity(entityTarget, entity);
    return saveEntity(entityTarget, dbEntity, getId, options);
}
exports.createAndSaveEntity = createAndSaveEntity;
async function findEntity(entityTarget, option) {
    const repo = getRepository(entityTarget);
    return option ? repo.find(option) : repo.find();
}
exports.findEntity = findEntity;
function convertDbEntityToResponseEntity(entity) {
    return JSON.parse(JSON.stringify(entity));
}
exports.convertDbEntityToResponseEntity = convertDbEntityToResponseEntity;
function expectEntitiesToMatch(responseEntity, dbEntity) {
    expect(responseEntity).toMatchObject(convertDbEntityToResponseEntity(dbEntity));
}
exports.expectEntitiesToMatch = expectEntitiesToMatch;
function convertDbEntitiesToResponseEntities(entities) {
    return entities.map(convertDbEntityToResponseEntity);
}
exports.convertDbEntitiesToResponseEntities = convertDbEntitiesToResponseEntities;
function expectEntityArraysToMatch(responseEntities, dbEntities) {
    expect(responseEntities).toMatchObject(dbEntities.map(convertDbEntityToResponseEntity));
}
exports.expectEntityArraysToMatch = expectEntityArraysToMatch;
//# sourceMappingURL=db-utils.js.map