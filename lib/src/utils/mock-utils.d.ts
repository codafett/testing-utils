/// <reference types="jest" />
import { AgentNote } from '@tiney/infrastructure';
export declare function mockCreateAgentNote(): jest.SpyInstance<Promise<string>, [
    AgentNote
]>;
export declare function mockPublishTopic(): jest.SpyInstance<Promise<string>, [{
    name: string;
    payload: unknown;
} | {
    name: string;
    payload: unknown;
    response: import("@tiney/infrastructure").ActionErrorResponse;
}]>;
export declare function getHttpGetMock(): jest.Mock<any, any>;
export declare function mockHttpGetCall(responseDefinitions: {
    status?: number;
    url: string;
    data: unknown;
}[]): jest.Mock<any, any>;
