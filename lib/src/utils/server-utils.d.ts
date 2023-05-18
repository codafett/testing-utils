import { Express, Router } from 'express';
export declare function createServerApp(app: ({ routes }: {
    routes: Router;
}) => Promise<Express>, routeConfig: [{
    path: string;
    router: Router;
}]): Promise<{
    expressApp: Express;
    server: unknown;
    agent: unknown;
}>;
