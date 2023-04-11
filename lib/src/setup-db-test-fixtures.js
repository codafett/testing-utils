"use strict";
// wait for the database connection and make sure to close it afterwards.
/* eslint-disable import/no-extraneous-dependencies */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUpTestFixtures = void 0;
const typeorm_1 = require("typeorm");
// eslint-disable-next-line import/no-extraneous-dependencies
const typeorm_transactional_tests_1 = require("typeorm-transactional-tests");
const db_config_settings_1 = __importDefault(require("./db-config-settings"));
function setUpTestFixtures(sqlFactory, databaseSettings, connectionSettings) {
    let dbConfigSettings;
    beforeAll(async () => {
        dbConfigSettings = new db_config_settings_1.default(databaseSettings, connectionSettings);
        await sqlFactory(dbConfigSettings.testDbDefaultConfig);
    });
    afterAll(async () => {
        await (0, typeorm_1.getConnection)().close();
    });
    let transactionalContext;
    beforeEach(async () => {
        const connection = await (0, typeorm_1.getConnection)();
        transactionalContext = new typeorm_transactional_tests_1.TransactionalTestContext(connection);
        await transactionalContext.start();
    });
    afterEach(async () => {
        await transactionalContext.finish();
    });
}
exports.setUpTestFixtures = setUpTestFixtures;
//# sourceMappingURL=setup-db-test-fixtures.js.map