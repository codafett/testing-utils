"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockHttpCall = exports.MockHttpCallType = void 0;
const nock_1 = __importDefault(require("nock"));
var MockHttpCallType;
(function (MockHttpCallType) {
    MockHttpCallType["HEAD"] = "head";
    MockHttpCallType["GET"] = "get";
    MockHttpCallType["POST"] = "post";
    MockHttpCallType["PUT"] = "put";
    MockHttpCallType["PATCH"] = "patch";
    MockHttpCallType["DELETE"] = "delete";
})(MockHttpCallType = exports.MockHttpCallType || (exports.MockHttpCallType = {}));
const httpCalls = ({
    [MockHttpCallType.HEAD]: (scope) => scope.head,
    [MockHttpCallType.GET]: (scope) => scope.get,
    [MockHttpCallType.POST]: (scope) => scope.post,
    [MockHttpCallType.PUT]: (scope) => scope.put,
    [MockHttpCallType.PATCH]: (scope) => scope.patch,
    [MockHttpCallType.DELETE]: (scope) => scope.delete
});
function mockHttpCall(basePath, httpCallDefinitions, allowUnmockedRequests) {
    const scope = (0, nock_1.default)(basePath, { allowUnmocked: allowUnmockedRequests || false });
    httpCallDefinitions.forEach((httpCallDefinition => {
        const httpInterceptor = httpCalls[httpCallDefinition.type](scope)(httpCallDefinition.url, httpCallDefinition.requestBody, httpCallDefinition.interceptorOptions);
        httpInterceptor.reply(httpCallDefinition.status || 200, { data: httpCallDefinition.responseData });
    }));
    return scope;
}
exports.mockHttpCall = mockHttpCall;
//# sourceMappingURL=mock-utils.js.map