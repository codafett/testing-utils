import nock, {
  InterceptFunction,
  Interceptor,
  Options,
  RequestBodyMatcher,
  Scope,
} from 'nock';

// eslint-disable-next-line no-shadow
export enum MockHttpCallType {
  HEAD = 'head',
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete',
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

const httpCalls: Record<string, (scope: Scope) => InterceptFunction> =
  {
    [MockHttpCallType.HEAD]: (scope: Scope) => scope.head,
    [MockHttpCallType.GET]: (scope: Scope) => scope.get,
    [MockHttpCallType.POST]: (scope: Scope) => scope.post,
    [MockHttpCallType.PUT]: (scope: Scope) => scope.put,
    [MockHttpCallType.PATCH]: (scope: Scope) => scope.patch,
    [MockHttpCallType.DELETE]: (scope: Scope) => scope.delete,
  };

export interface HttpMockOptions {
  allowUnmockedRequests?: boolean;
  persist?: boolean;
}

export function mockHttpCalls(
  basePath: string,
  httpCallDefinitions: HttpCallDefinition[],
  options: HttpMockOptions = { persist: false },
) {
  const scope = nock(basePath, {
    allowUnmocked: options?.allowUnmockedRequests || false,
  });
  httpCallDefinitions.forEach((httpCallDefinition) => {
    const httpInterceptor: Interceptor = httpCalls[
      httpCallDefinition.type
    ](scope).call(
      scope,
      httpCallDefinition.url,
      httpCallDefinition.requestBody,
      httpCallDefinition.interceptorOptions,
    );
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

export function cleanAllMockHttpCalls() {
  nock.cleanAll();
}

export function onUnmockedCall(handler: (req: unknown) => void) {
  nock.emitter.on('no match', handler);
}
