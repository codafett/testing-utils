"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServerApp = void 0;
const infrastructure_1 = require("@tiney/infrastructure");
const express_1 = require("express");
// eslint-disable-next-line import/no-extraneous-dependencies
const supertest_1 = __importDefault(require("supertest"));
async function createServerApp(routeConfig) {
    const routes = (0, express_1.Router)({ strict: true });
    routeConfig.map((rc) => routes.use(rc.path, rc.router));
    const app = await (0, infrastructure_1.web)({ routes });
    let server;
    let agent;
    const getServer = new Promise((resolve) => {
        server = app.listen(() => {
            agent = supertest_1.default.agent(app);
            resolve(agent);
        });
    });
    await getServer;
    return { app, server, agent };
}
exports.createServerApp = createServerApp;
//# sourceMappingURL=server-utils.js.map