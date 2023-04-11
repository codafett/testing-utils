import {
  AgentNote,
  agentNoteService,
  http,
  pubsubService,
} from '@tiney/infrastructure';

export function mockCreateAgentNote(): jest.SpyInstance<
  Promise<string>,
  [AgentNote]
> {
  return jest
    .spyOn(agentNoteService, 'createAutoAgentNote')
    .mockImplementation(() => Promise.resolve('done'));
}

export function mockPublishTopic() {
  return jest
    .spyOn(pubsubService, 'publishTopic')
    .mockImplementation(() => Promise.resolve('done'));
}

export function getHttpGetMock() {
  const httpMockGet = jest.fn();
  http.get = httpMockGet;
  return httpMockGet;
}

export function mockHttpGetCall(
  responseDefinitions: {
    status?: number;
    url: string;
    data: unknown;
  }[],
) {
  const httpGetMock = getHttpGetMock();
  httpGetMock.mockImplementation((url) => {
    const responseDefinition = responseDefinitions.find(
      (rd) => rd.url === url,
    );
    if (responseDefinition) {
      return Promise.resolve({
        data: { data: responseDefinition.data },
        status: responseDefinition.status || 200,
      });
    }
    console.error(`Url: ${url} has not been mocked`);
    return Promise.reject(
      new Error(`Url: ${url} has not been mocked`),
    );
  });
  return httpGetMock;
}
