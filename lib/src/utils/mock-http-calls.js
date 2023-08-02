"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockHttpCalls = exports.MockHttpCallType = void 0;
const nock_1 = __importDefault(require("nock"));
// eslint-disable-next-line no-shadow
var MockHttpCallType;
(function (MockHttpCallType) {
    MockHttpCallType["HEAD"] = "head";
    MockHttpCallType["GET"] = "get";
    MockHttpCallType["POST"] = "post";
    MockHttpCallType["PUT"] = "put";
    MockHttpCallType["PATCH"] = "patch";
    MockHttpCallType["DELETE"] = "delete";
})(MockHttpCallType = exports.MockHttpCallType || (exports.MockHttpCallType = {}));
const httpCalls = {
    [MockHttpCallType.HEAD]: (scope) => scope.head,
    [MockHttpCallType.GET]: (scope) => scope.get,
    [MockHttpCallType.POST]: (scope) => scope.post,
    [MockHttpCallType.PUT]: (scope) => scope.put,
    [MockHttpCallType.PATCH]: (scope) => scope.patch,
    [MockHttpCallType.DELETE]: (scope) => scope.delete,
};
function mockHttpCalls(basePath, httpCallDefinitions, options = { persist: false }) {
    const scope = (0, nock_1.default)(basePath, {
        allowUnmocked: options?.allowUnmockedRequests || false,
    });
    httpCallDefinitions.forEach((httpCallDefinition) => {
        const httpInterceptor = httpCalls[httpCallDefinition.type](scope).call(scope, httpCallDefinition.url, httpCallDefinition.requestBody, httpCallDefinition.interceptorOptions);
        httpInterceptor
            .reply(httpCallDefinition.status || 200, {
            data: httpCallDefinition.responseData,
        })
            .persist(httpCallDefinition.persist);
    });
    if (options.persist) {
        scope.persist();
    }
    return scope;
}
exports.mockHttpCalls = mockHttpCalls;
//# sourceMappingURL=mock-http-calls.js.map