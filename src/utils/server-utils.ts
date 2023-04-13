import { Router } from 'express';
// eslint-disable-next-line import/no-extraneous-dependencies
import request from 'supertest';

export async function createServerApp(
  app: any,
  routeConfig: [{ path: string; router: Router }],
) {
  const routes: Router = Router({ strict: true });

  routeConfig.map((rc) => routes.use(rc.path, rc.router));

  let server: unknown;
  let agent: unknown;

  const getServer = new Promise((resolve) => {
    server = app.listen(() => {
      agent = request.agent(app);
      resolve(agent);
    });
  });

  await getServer;
  return { app, server, agent };
}
