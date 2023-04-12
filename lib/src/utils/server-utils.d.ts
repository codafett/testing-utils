import { Router } from 'express';
export declare function createServerApp(routeConfig: [{
    path: string;
    router: Router;
}]): Promise<{
    app: Express;
    server: unknown;
    agent: unknown;
}>;
