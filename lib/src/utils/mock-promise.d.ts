/// <reference types="jest" />
export declare function mockAsyncMethod(instance: any, functionName: string, mockImplementation?: () => Promise<any>): jest.SpyInstance<any, unknown[]>;
