import nock, { Options, RequestBodyMatcher } from 'nock';
export declare enum MockHttpCallType {
    HEAD = "head",
    GET = "get",
    POST = "post",
    PUT = "put",
    PATCH = "patch",
    DELETE = "delete"
}
export interface HttpCallDefinition {
    url: string;
    type: MockHttpCallType;
    requestBody?: RequestBodyMatcher;
    responseData?: unknown;
    interceptorOptions?: Options;
    status?: number;
    persist?: boolean;
}
export interface HttpMockOptions {
    allowUnmockedRequests?: boolean;
    persist?: boolean;
}
export declare function mockHttpCalls(basePath: string, httpCallDefinitions: HttpCallDefinition[], options?: HttpMockOptions): nock.Scope;
export declare function cleanAllMockHttpCalls(): void;
export declare function onUnmockedCall(handler: (req: unknown) => void): void;
