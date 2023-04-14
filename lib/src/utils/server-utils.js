"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServerApp = void 0;
const express_1 = require("express");
const supertest_1 = __importDefault(require("supertest"));
async function createServerApp(app, routeConfig) {
    const routes = (0, express_1.Router)({ strict: true });
    routeConfig.map((rc) => routes.use(rc.path, rc.router));
    const expressApp = await app({ routes });
    let server;
    let agent;
    const getServer = new Promise((resolve) => {
        server = expressApp.listen(() => {
            agent = supertest_1.default.agent(expressApp);
            resolve(agent);
        });
    });
    await getServer;
    return { expressApp, server, agent };
}
exports.createServerApp = createServerApp;
//# sourceMappingURL=server-utils.js.map