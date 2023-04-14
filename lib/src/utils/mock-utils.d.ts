import nock, { Options, RequestBodyMatcher } from 'nock';
export interface HttpCallDefinition {
    url: string;
    type: MockHttpCallType;
    requestBody?: RequestBodyMatcher;
    responseData?: unknown;
    interceptorOptions?: Options;
    status?: number;
}
export declare enum MockHttpCallType {
    HEAD = "head",
    GET = "get",
    POST = "post",
    PUT = "put",
    PATCH = "patch",
    DELETE = "delete"
}
export declare function mockHttpCall(basePath: string, httpCallDefinitions: HttpCallDefinition[], allowUnmockedRequests?: boolean): nock.Scope;
