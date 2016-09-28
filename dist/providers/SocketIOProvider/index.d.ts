import { Provider, Request, Response } from '../../abstract/';
export default class SocketIOProvider extends Provider {
    private queue;
    private retryTimeout;
    private server;
    private client;
    private requestQueue;
    private responseQueue;
    private serverClientMap;
    constructor(portOrHost: number | string);
    getRequest(): Promise<Request>;
    respondRequest(res: Response): Promise<void>;
    sendRequest(req: Request): Promise<void>;
    getResponse(): Promise<Response>;
}
