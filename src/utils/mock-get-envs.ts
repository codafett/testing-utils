export function mockGetEnvs(settings) {
  jest.mock('@tiney/infrastructure', () => {
    return {
      ...(jest.requireActual('@tiney/infrastructure') as {}),
      getEnvs: (envName) => settings[envName],
    };
  });
  }