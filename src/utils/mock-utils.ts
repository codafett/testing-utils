import nock, { InterceptFunction, Interceptor, Options, RequestBodyMatcher, Scope } from 'nock';

export interface HttpCallDefinition {
  url: string;
  type: MockHttpCallType,
  requestBody?: RequestBodyMatcher,
  responseData?: unknown;
  interceptorOptions?: Options
  status?: number;
}

export enum MockHttpCallType {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete'
}

const httpCalls: Record<string, (scope: Scope) => InterceptFunction> = ({
  [MockHttpCallType.GET]: (scope: Scope) => scope.get
});

export function mockHttpGetCall(
  basePath: string,
  httpCallDefinitions: HttpCallDefinition[],
  allowUnmockedRequests: boolean
) {
  const scope = nock(basePath, { allowUnmocked: allowUnmockedRequests});
  httpCallDefinitions.forEach(
    (httpCallDefinition => {
      const httpInterceptor: Interceptor = 
        httpCalls[httpCallDefinition.type]
        (scope)
        (httpCallDefinition.url, httpCallDefinition.requestBody, httpCallDefinition.interceptorOptions)
      httpInterceptor.reply(httpCallDefinition.status || 200, { data: httpCallDefinition.responseData });
    })
  )
  return scope;
}
