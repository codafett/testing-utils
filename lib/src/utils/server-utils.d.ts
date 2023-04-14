import { Router, Express } from 'express';
export declare function createServerApp(app: Express, routeConfig: [{
    path: string;
    router: Router;
}]): Promise<{
    expressApp: any;
    server: unknown;
    agent: unknown;
}>;
