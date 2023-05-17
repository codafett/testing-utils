import { Express, Router } from 'express';
import request from 'supertest';

export async function createServerApp(
  app: ({ routes }: { routes: Router }) => Promise<Express>,
  routeConfig: [{ path: string; router: Router }],
) {
  const routes: Router = Router({ strict: true });

  routeConfig.map((rc) => routes.use(rc.path, rc.router));

  const expressApp = await app({ routes });
  let server: unknown;
  let agent: unknown;

  const getServer = new Promise((resolve) => {
    server = expressApp.listen(() => {
      agent = request.agent(expressApp);
      resolve(agent);
    });
  });

  await getServer;
  return { expressApp, server, agent };
}
