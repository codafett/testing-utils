export function mockAsyncMethod(
  instance: any,
  functionName: string,
  mockImplementation: () => Promise<any> = () =>
    Promise.resolve('done'),
) {
  return jest
    .spyOn(instance, functionName)
    .mockImplementation(mockImplementation);
}
