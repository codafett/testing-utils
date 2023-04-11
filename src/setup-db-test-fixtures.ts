// wait for the database connection and make sure to close it afterwards.
/* eslint-disable import/no-extraneous-dependencies */

import { Connection, getConnection } from 'typeorm';
// eslint-disable-next-line import/no-extraneous-dependencies
import { TransactionalTestContext } from 'typeorm-transactional-tests';

import DbConfigSettings from './db-config-settings';
import { ConnectionSettings, DatabaseSettings } from './types';

export function setUpTestFixtures(
  sqlFactory,
  databaseSettings: DatabaseSettings,
  connectionSettings?: ConnectionSettings,
) {
  let dbConfigSettings: DbConfigSettings;
  beforeAll(async () => {
    dbConfigSettings = new DbConfigSettings(
      databaseSettings,
      connectionSettings,
    );
    await sqlFactory(dbConfigSettings.testDbDefaultConfig);
  });
  afterAll(async () => {
    await getConnection().close();
  });
  let transactionalContext: TransactionalTestContext;
  beforeEach(async () => {
    const connection: Connection = await getConnection();
    transactionalContext = new TransactionalTestContext(connection);
    await transactionalContext.start();
  });
  afterEach(async () => {
    await transactionalContext.finish();
  });
}
