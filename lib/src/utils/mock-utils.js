"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockHttpGetCall = exports.getHttpGetMock = exports.mockPublishTopic = exports.mockCreateAgentNote = void 0;
const infrastructure_1 = require("@tiney/infrastructure");
function mockCreateAgentNote() {
    return jest
        .spyOn(infrastructure_1.agentNoteService, 'createAutoAgentNote')
        .mockImplementation(() => Promise.resolve('done'));
}
exports.mockCreateAgentNote = mockCreateAgentNote;
function mockPublishTopic() {
    return jest
        .spyOn(infrastructure_1.pubsubService, 'publishTopic')
        .mockImplementation(() => Promise.resolve('done'));
}
exports.mockPublishTopic = mockPublishTopic;
function getHttpGetMock() {
    const httpMockGet = jest.fn();
    infrastructure_1.http.get = httpMockGet;
    return httpMockGet;
}
exports.getHttpGetMock = getHttpGetMock;
function mockHttpGetCall(responseDefinitions) {
    const httpGetMock = getHttpGetMock();
    httpGetMock.mockImplementation((url) => {
        const responseDefinition = responseDefinitions.find((rd) => rd.url === url);
        if (responseDefinition) {
            return Promise.resolve({
                data: { data: responseDefinition.data },
                status: responseDefinition.status || 200,
            });
        }
        console.error(`Url: ${url} has not been mocked`);
        return Promise.reject(new Error(`Url: ${url} has not been mocked`));
    });
    return httpGetMock;
}
exports.mockHttpGetCall = mockHttpGetCall;
//# sourceMappingURL=mock-utils.js.map