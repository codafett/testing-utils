"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockAsyncCall = void 0;
function mockAsyncCall(instance, functionName, mockImplementation = () => Promise.resolve('done')) {
    return jest
        .spyOn(instance, functionName)
        .mockImplementation(mockImplementation);
}
exports.mockAsyncCall = mockAsyncCall;
//# sourceMappingURL=mock-async-call.js.map