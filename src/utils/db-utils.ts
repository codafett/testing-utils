import {
  DeepPartial,
  EntityTarget,
  FindManyOptions,
  FindOneOptions,
  getConnection,
  SaveOptions,
} from 'typeorm';

export interface FindEntityOptions<ET> {
  findOneOptions?: FindOneOptions<ET>;
  findManyOptions?: FindManyOptions<ET>;
}

export interface SaveEntityOptions<ET> extends FindEntityOptions<ET> {
  saveOptions?: SaveOptions;
}

export function getRepository<ET>(entityTarget: EntityTarget<ET>) {
  return getConnection().getRepository(entityTarget);
}

export function createEntity<ET>(
  entityTarget: EntityTarget<ET>,
  entity?: DeepPartial<ET>,
): ET {
  const repo = getRepository(entityTarget);
  return entity ? repo.create(entity) : repo.create();
}

function getEntityId(entity: unknown) {
  let entityId;
  if (Object.prototype.hasOwnProperty.call(entity, 'id')) {
    entityId = (entity as { id: string | number | Date }).id;
  }
  return entityId;
}

function getEntitySlug(entity: unknown) {
  let entityId;
  if (Object.prototype.hasOwnProperty.call(entity, 'slug')) {
    entityId = (entity as { slug: string }).slug;
  }
  return entityId;
}

export async function getEntity<ET>(
  entityTarget: EntityTarget<ET>,
  id: string | number | Date,
  options?: FindOneOptions<ET>,
): Promise<ET | undefined> {
  const repo = getRepository(entityTarget);
  return repo.findOne(id, options);
}

export async function saveEntity<ET>(
  entityTarget: EntityTarget<ET>,
  entity?: ET,
  getId?: (entity: ET) => string | number | Date,
  options?: SaveEntityOptions<ET>,
): Promise<ET> {
  const repo = getRepository(entityTarget);
  let dbEntity: ET;
  dbEntity = await repo.save(
    entity as DeepPartial<ET>,
    options?.saveOptions,
  );
  const dbEntityId = getId?.(dbEntity) || getEntityId(dbEntity);
  if (dbEntityId) {
    dbEntity =
      (await getEntity(
        entityTarget,
        dbEntityId,
        options?.findOneOptions,
      )) || dbEntity;
  } else {
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

export async function createAndSaveEntity<ET>(
  entityTarget: EntityTarget<ET>,
  entity: DeepPartial<ET>,
  getId?: (entity: ET) => string | number | Date,
  options?: SaveEntityOptions<ET>,
): Promise<ET> {
  const dbEntity = createEntity(entityTarget, entity);
  return saveEntity(entityTarget, dbEntity, getId, options);
}

export async function findEntity<ET>(
  entityTarget: EntityTarget<ET>,
  option?: FindManyOptions<ET>,
): Promise<ET[]> {
  const repo = getRepository(entityTarget);
  return option ? repo.find(option) : repo.find();
}

export function convertDbEntityToResponseEntity(entity: unknown) {
  return JSON.parse(JSON.stringify(entity));
}

export function expectEntitiesToMatch(responseEntity, dbEntity) {
  expect(responseEntity).toMatchObject(
    convertDbEntityToResponseEntity(dbEntity),
  );
}

export function convertDbEntitiesToResponseEntities(
  entities: unknown[],
) {
  return entities.map(convertDbEntityToResponseEntity);
}

export function expectEntityArraysToMatch(
  responseEntities,
  dbEntities,
) {
  expect(responseEntities).toMatchObject(
    dbEntities.map(convertDbEntityToResponseEntity),
  );
}
