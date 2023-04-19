"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockAsyncMethod = void 0;
function mockAsyncMethod(instance, functionName, mockImplementation = () => Promise.resolve('done')) {
    return jest
        .spyOn(instance, functionName)
        .mockImplementation(mockImplementation);
}
exports.mockAsyncMethod = mockAsyncMethod;
//# sourceMappingURL=mock-promise.js.map